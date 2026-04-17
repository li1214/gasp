"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RealNameForm({
  initialRealName,
  redirectTo
}: {
  initialRealName?: string | null;
  redirectTo: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    setLoading(true);
    setError("");

    const response = await fetch("/api/me/realname", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        realName: String(fd.get("realName") || "").trim(),
        idCardNo: String(fd.get("idCardNo") || "").trim()
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "实名认证失败");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="app-card p-5 space-y-4" onSubmit={onSubmit}>
      <div>
        <h1 className="text-xl font-semibold">实名认证</h1>
        <p className="text-sm text-slate-500 mt-1">
          发布账号前需先完成实名认证。平台仅用于账号信息展示，不参与交易。
        </p>
      </div>

      <div>
        <label className="text-sm">真实姓名</label>
        <input className="field mt-1" name="realName" defaultValue={initialRealName || ""} required />
      </div>

      <div>
        <label className="text-sm">身份证号</label>
        <input className="field mt-1" name="idCardNo" required placeholder="15位或18位身份证号" />
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 leading-6">
        未成年人禁止发布账号；请确保填写信息真实有效。
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button className="btn w-full" type="submit" disabled={loading}>
        {loading ? "提交中..." : "提交实名认证"}
      </button>
    </form>
  );
}
