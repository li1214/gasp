"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SiteConfigForm({
  customerServiceUrl,
  userGroupUrl,
  publishNotice
}: {
  customerServiceUrl: string;
  userGroupUrl: string;
  publishNotice: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    setOk("");

    const response = await fetch("/api/admin/site-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerServiceUrl: String(fd.get("customerServiceUrl") || ""),
        userGroupUrl: String(fd.get("userGroupUrl") || ""),
        publishNotice: String(fd.get("publishNotice") || "")
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "保存失败");
      return;
    }

    setOk("保存成功");
    router.refresh();
  }

  return (
    <form className="app-card p-4 space-y-3" onSubmit={onSubmit}>
      <h2 className="font-semibold">站点配置（详情页按钮）</h2>
      <div>
        <label className="text-sm">客服链接（咨询客服）</label>
        <input className="field mt-1" name="customerServiceUrl" defaultValue={customerServiceUrl} placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm">用户交流群链接</label>
        <input className="field mt-1" name="userGroupUrl" defaultValue={userGroupUrl} placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm">账号发布须知</label>
        <textarea className="field mt-1 min-h-[160px]" name="publishNotice" defaultValue={publishNotice} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? "保存中..." : "保存配置"}
      </button>
    </form>
  );
}