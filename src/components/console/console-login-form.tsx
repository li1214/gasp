"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, RefreshCcw, ShieldCheck } from "lucide-react";

export function ConsoleLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  async function refreshCaptcha() {
    setCaptchaLoading(true);
    try {
      const response = await fetch("/api/auth/captcha?scene=login");
      const result = await response.json();
      if (response.ok) {
        setCaptchaId(result.captchaId || "");
        setCaptchaSvg(result.svg || "");
      }
    } finally {
      setCaptchaLoading(false);
    }
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: String(fd.get("phone") || "").trim(),
        password: String(fd.get("password") || ""),
        captchaCode: String(fd.get("captchaCode") || "").trim(),
        captchaId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(result.error || "登录失败");
      refreshCaptcha();
      return;
    }

    if (result.user?.role !== "ADMIN") {
      await fetch("/api/auth/logout", { method: "POST" });
      setLoading(false);
      setError("该账号没有后台权限");
      return;
    }

    router.push("/console");
    router.refresh();
  }

  return (
    <form className="console-login-form" onSubmit={onSubmit}>
      <div className="console-login-title">
        <ShieldCheck size={18} /> 管理员安全登录
      </div>

      <label className="console-login-label">手机号</label>
      <input className="field" name="phone" placeholder="请输入手机号" required />

      <label className="console-login-label">密码</label>
      <input className="field" name="password" type="password" placeholder="请输入密码" required />

      <label className="console-login-label">验证码</label>
      <div className="flex gap-2">
        <input className="field" name="captchaCode" placeholder="输入验证码" required />
        <button type="button" className="btn btn-outline whitespace-nowrap" onClick={refreshCaptcha} disabled={captchaLoading}>
          <RefreshCcw size={14} />
        </button>
      </div>
      <div className="console-captcha-box">
        {captchaSvg ? <div dangerouslySetInnerHTML={{ __html: captchaSvg }} /> : <span>验证码加载中...</span>}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button className="btn w-full !rounded-xl" type="submit" disabled={loading || !captchaId}>
        <LockKeyhole size={14} /> {loading ? "登录中..." : "进入后台"}
      </button>
    </form>
  );
}
