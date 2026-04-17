"use client";

import { FormEvent, useState } from "react";

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    setLoading(true);
    setError("");
    setOk("");

    const response = await fetch("/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPassword: String(fd.get("oldPassword") || ""),
        newPassword: String(fd.get("newPassword") || ""),
        confirmPassword: String(fd.get("confirmPassword") || "")
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "修改失败");
      return;
    }

    setOk("密码修改成功，请妥善保管新密码");
    event.currentTarget.reset();
  }

  return (
    <form className="app-card p-4 space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm">旧密码</label>
        <input className="field mt-1" name="oldPassword" type="password" required />
      </div>
      <div>
        <label className="text-sm">新密码</label>
        <input className="field mt-1" name="newPassword" type="password" required />
      </div>
      <div>
        <label className="text-sm">确认新密码</label>
        <input className="field mt-1" name="confirmPassword" type="password" required />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "提交中..." : "修改密码"}
      </button>
    </form>
  );
}