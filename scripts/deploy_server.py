#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import deque
import datetime as dt
import fnmatch
import os
import posixpath
import shlex
import sys
import tarfile
import tempfile
import time
from pathlib import Path

import paramiko

EXCLUDE_DIRS = {
    ".git",
    ".next",
    "node_modules",
    "coverage",
    "dist",
    "tmp",
    "logs",
    "public/uploads"
}

EXCLUDE_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    "tsconfig.tsbuildinfo"
}

EXCLUDE_GLOBS = [
    "*.log",
    "*.tmp",
    "*.bak"
]


def should_skip(path: Path, project_root: Path) -> bool:
    rel = path.relative_to(project_root).as_posix()

    if rel in EXCLUDE_FILES:
        return True

    parts = rel.split("/")
    prefix = ""
    for part in parts:
        prefix = f"{prefix}/{part}" if prefix else part
        if prefix in EXCLUDE_DIRS:
            return True

    for pattern in EXCLUDE_GLOBS:
        if fnmatch.fnmatch(path.name, pattern) or fnmatch.fnmatch(rel, pattern):
            return True

    return False


def build_archive(project_root: Path) -> Path:
    stamp = dt.datetime.now().strftime("%Y%m%d%H%M%S")
    fd, temp_path = tempfile.mkstemp(prefix=f"sgzz-release-{stamp}-", suffix=".tar.gz")
    os.close(fd)
    archive_path = Path(temp_path)

    with tarfile.open(archive_path, "w:gz") as tar:
        for path in sorted(project_root.rglob("*")):
            if should_skip(path, project_root):
                continue
            rel = path.relative_to(project_root).as_posix()
            tar.add(path, arcname=rel)

    return archive_path


def render_remote_env(local_env_path: Path, db_user: str, db_password: str, db_name: str, db_host: str) -> str:
    if local_env_path.exists():
        lines = local_env_path.read_text(encoding="utf-8").splitlines()
    else:
        lines = []

    database_line = f'DATABASE_URL="mysql://{db_user}:{db_password}@{db_host}:3306/{db_name}?charset=utf8mb4"'

    replaced = False
    out: list[str] = []
    has_node_env = False
    has_disable_telemetry = False

    for line in lines:
        if line.startswith("DATABASE_URL="):
            out.append(database_line)
            replaced = True
            continue
        if line.startswith("NODE_ENV="):
            out.append("NODE_ENV=production")
            has_node_env = True
            continue
        if line.startswith("NEXT_TELEMETRY_DISABLED="):
            out.append("NEXT_TELEMETRY_DISABLED=1")
            has_disable_telemetry = True
            continue
        out.append(line)

    if not replaced:
        out.insert(0, database_line)
    if not has_node_env:
        out.append("NODE_ENV=production")
    if not has_disable_telemetry:
        out.append("NEXT_TELEMETRY_DISABLED=1")

    return "\n".join(out).strip() + "\n"


def run_remote(ssh: paramiko.SSHClient, command: str, *, label: str, check: bool = True) -> None:
    def _safe_text(text: str) -> str:
      encoding = sys.stdout.encoding or "utf-8"
      return text.encode(encoding, errors="ignore").decode(encoding, errors="ignore")

    print(f"\n>>> {label}")
    print(f"$ {command}")
    stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
    channel = stdout.channel
    recent_lines: deque[str] = deque(maxlen=80)
    pending = ""

    while True:
        made_progress = False

        while channel.recv_ready():
            data = channel.recv(4096)
            if not data:
                break
            text = _safe_text(data.decode("utf-8", errors="ignore"))
            print(text, end="", flush=True)
            pending += text
            parts = pending.splitlines(keepends=True)
            pending = ""
            if parts and not (parts[-1].endswith("\n") or parts[-1].endswith("\r")):
                pending = parts.pop()
            for line in parts:
                recent_lines.append(line.rstrip("\r\n"))
            made_progress = True

        while channel.recv_stderr_ready():
            data = channel.recv_stderr(4096)
            if not data:
                break
            text = _safe_text(data.decode("utf-8", errors="ignore"))
            print(text, end="", file=sys.stderr, flush=True)
            pending += text
            parts = pending.splitlines(keepends=True)
            pending = ""
            if parts and not (parts[-1].endswith("\n") or parts[-1].endswith("\r")):
                pending = parts.pop()
            for line in parts:
                recent_lines.append(line.rstrip("\r\n"))
            made_progress = True

        if channel.exit_status_ready():
            while channel.recv_ready():
                data = channel.recv(4096)
                if not data:
                    break
                text = _safe_text(data.decode("utf-8", errors="ignore"))
                print(text, end="", flush=True)
            while channel.recv_stderr_ready():
                data = channel.recv_stderr(4096)
                if not data:
                    break
                text = _safe_text(data.decode("utf-8", errors="ignore"))
                print(text, end="", file=sys.stderr, flush=True)
            break

        if not made_progress:
            time.sleep(0.1)

    code = channel.recv_exit_status() if channel.exit_status_ready() else -1
    if pending:
        recent_lines.append(pending.rstrip("\r\n"))

    if check and code != 0:
        tail = "\n".join(line for line in recent_lines if line.strip())
        if code == -1:
            raise RuntimeError(
                f"Remote command failed (exit=-1): {label}. "
                "SSH channel closed unexpectedly (possible network drop or remote OOM/process kill).\n"
                f"Recent output:\n{tail}"
            )
        raise RuntimeError(f"Remote command failed (exit={code}): {label}\nRecent output:\n{tail}")


def upload_text(sftp: paramiko.SFTPClient, remote_path: str, content: str) -> None:
    with sftp.file(remote_path, "w") as fp:
        fp.write(content)


def main() -> int:
    parser = argparse.ArgumentParser(description="Deploy SGZZ project to Ubuntu server")
    parser.add_argument("--host", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--project-root", default=".")
    parser.add_argument("--remote-dir", default="/home/ubuntu/apps/sgzz-account-market")
    parser.add_argument("--app-name", default="sgzz-account-market")
    parser.add_argument("--port", default="3000")
    parser.add_argument("--db-host", default="127.0.0.1")
    parser.add_argument("--db-user", default="root")
    parser.add_argument("--db-password", required=True)
    parser.add_argument("--db-name", default="sgzz_market")
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    if not (project_root / "package.json").exists():
        raise FileNotFoundError(f"package.json not found in {project_root}")

    print("Creating release archive...")
    archive_path = build_archive(project_root)
    print(f"Archive created: {archive_path}")

    remote_archive = f"/tmp/{args.app_name}-{dt.datetime.now().strftime('%Y%m%d%H%M%S')}.tar.gz"
    remote_env = f"/tmp/{args.app_name}.env"

    local_env_path = project_root / ".env"
    env_content = render_remote_env(local_env_path, args.db_user, args.db_password, args.db_name, args.db_host)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"Connecting to {args.user}@{args.host} ...")
        ssh.connect(
            hostname=args.host,
            username=args.user,
            password=args.password,
            look_for_keys=False,
            allow_agent=False,
            timeout=20
        )
        transport = ssh.get_transport()
        if transport is not None:
            transport.set_keepalive(30)

        run_remote(ssh, "node -v && npm -v && pm2 -v", label="Check remote runtime")

        sftp = ssh.open_sftp()
        try:
            print(f"Uploading archive to {remote_archive} ...")
            sftp.put(str(archive_path), remote_archive)
            print(f"Uploading env to {remote_env} ...")
            upload_text(sftp, remote_env, env_content)
        finally:
            sftp.close()

        sql = f"CREATE DATABASE IF NOT EXISTS {args.db_name} DEFAULT CHARACTER SET utf8mb4;"
        sql_cmd = f"mysql -u{args.db_user} -p{shlex.quote(args.db_password)} -e {shlex.quote(sql)}"

        remote_dir = shlex.quote(args.remote_dir)
        app_name = shlex.quote(args.app_name)
        app_port = shlex.quote(str(args.port))
        remote_env_target = shlex.quote(posixpath.join(args.remote_dir, ".env"))
        remote_archive_q = shlex.quote(remote_archive)
        remote_env_q = shlex.quote(remote_env)

        deploy_steps = [
            ("Prepare remote directory", f"mkdir -p {remote_dir}"),
            ("Extract release archive", f"tar -xzf {remote_archive_q} -C {remote_dir}"),
            ("Write remote .env", f"cp {remote_env_q} {remote_env_target}"),
            ("Ensure database exists", f"cd {remote_dir} && ({sql_cmd} || true)"),
            ("Install dependencies", f"cd {remote_dir} && npm install --no-audit --no-fund"),
            ("Generate Prisma client", f"cd {remote_dir} && npm run prisma:generate"),
            ("Push Prisma schema", f"cd {remote_dir} && npx prisma db push --skip-generate"),
            ("Build application", f"cd {remote_dir} && npm run build"),
            (
                "Restart PM2 process",
                f"cd {remote_dir} && (pm2 delete {app_name} || true) && "
                f"pm2 start ./node_modules/next/dist/bin/next --name {app_name} -- start -p {app_port}",
            ),
            ("Save PM2 process list", "pm2 save"),
            ("Check PM2 status", f"pm2 status {app_name}"),
        ]

        for step_label, step_cmd in deploy_steps:
            run_remote(ssh, step_cmd, label=step_label)
        health_cmd = (
            "for i in $(seq 1 15); do "
            f"curl -I --max-time 5 http://127.0.0.1:{shlex.quote(str(args.port))} && exit 0; "
            "sleep 2; "
            "done; "
            "exit 1"
        )
        run_remote(ssh, health_cmd, label="Health check")

        print("\nDeployment completed successfully.")
    finally:
        try:
            archive_path.unlink(missing_ok=True)
        except Exception:
            pass
        ssh.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
