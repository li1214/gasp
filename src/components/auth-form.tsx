"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const scene = mode === "login" ? "login" : "register";

  async function refreshCaptcha() {
    setCaptchaLoading(true);
    try {
      const response = await fetch(`/api/auth/captcha?scene=${scene}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload = {
      phone: String(formData.get("phone") || ""),
      password: String(formData.get("password") || ""),
      nickname: String(formData.get("nickname") || ""),
      captchaCode: String(formData.get("captchaCode") || ""),
      captchaId
    };

    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(result.error || "提交失败");
      refreshCaptcha();
      return;
    }

    if (mode === "login" && result.user?.role === "ADMIN") {
      router.push("/console");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <form className="app-card p-5 space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-xl font-semibold">{mode === "login" ? "账号登录" : "注册账号"}</h1>
      <p className="text-sm text-slate-500">
        {mode === "login" ? "登录后可发布账号并管理我的商品" : "注册后即可发布三国志战略版账号"}
      </p>

      <div>
        <label className="text-sm">手机号</label>
        <input className="field mt-1" name="phone" placeholder="11位手机号" required />
      </div>

      {mode === "register" ? (
        <div>
          <label className="text-sm">昵称</label>
          <input className="field mt-1" name="nickname" placeholder="2-20字" required />
        </div>
      ) : null}

      <div>
        <label className="text-sm">密码</label>
        <input className="field mt-1" name="password" type="password" placeholder="至少6位" required />
      </div>

      <div>
        <label className="text-sm">验证码</label>
        <div className="mt-1 flex gap-2">
          <input className="field" name="captchaCode" placeholder="输入验证码" required />
          <button
            type="button"
            className="btn btn-outline whitespace-nowrap"
            onClick={refreshCaptcha}
            disabled={captchaLoading}
          >
            {captchaLoading ? "加载中" : "刷新"}
          </button>
        </div>
        <div className="mt-2 h-[54px] w-[160px] overflow-hidden rounded-xl border border-slate-200 bg-white">
          {captchaSvg ? (
            <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">验证码加载中...</div>
          )}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button className="btn w-full" disabled={loading || !captchaId} type="submit">
        {loading ? "提交中..." : mode === "login" ? "登录" : "注册"}
      </button>

      <p className="text-sm text-slate-500">
        {mode === "login" ? "还没有账号？" : "已有账号？"}
        <Link className="text-brand-600 ml-1" href={mode === "login" ? "/auth/register" : "/auth/login"}>
          {mode === "login" ? "去注册" : "去登录"}
        </Link>
      </p>
    </form>
  );
}
