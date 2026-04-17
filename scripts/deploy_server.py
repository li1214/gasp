#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import fnmatch
import os
import posixpath
import shlex
import sys
import tarfile
import tempfile
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
    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")
    code = stdout.channel.recv_exit_status()

    if out.strip():
        print(_safe_text(out.strip()))
    if err.strip():
        print(_safe_text(err.strip()), file=sys.stderr)

    if check and code != 0:
        raise RuntimeError(f"Remote command failed (exit={code}): {label}")


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

        deploy_cmd = " && ".join(
            [
                f"mkdir -p {shlex.quote(args.remote_dir)}",
                f"tar -xzf {shlex.quote(remote_archive)} -C {shlex.quote(args.remote_dir)}",
                f"cp {shlex.quote(remote_env)} {shlex.quote(posixpath.join(args.remote_dir, '.env'))}",
                f"cd {shlex.quote(args.remote_dir)}",
                f"({sql_cmd} || true)",
                "npm install --no-audit --no-fund",
                "npm run prisma:generate",
                "npx prisma db push --skip-generate",
                "npm run build",
                f"(pm2 delete {shlex.quote(args.app_name)} || true)",
                f"pm2 start ./node_modules/next/dist/bin/next --name {shlex.quote(args.app_name)} -- start -p {shlex.quote(str(args.port))}",
                "pm2 save",
                f"pm2 status {shlex.quote(args.app_name)}"
            ]
        )

        run_remote(ssh, deploy_cmd, label="Deploy application")
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
