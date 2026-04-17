"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({
  nickname,
  realName
}: {
  nickname: string;
  realName?: string | null;
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

    const response = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: String(fd.get("nickname") || ""),
        realName: String(fd.get("realName") || ""),
        contactInfo: String(fd.get("contactInfo") || "")
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
      <div>
        <label className="text-sm">昵称</label>
        <input className="field mt-1" name="nickname" defaultValue={nickname} required />
      </div>
      <div>
        <label className="text-sm">实名姓名（可选）</label>
        <input className="field mt-1" name="realName" defaultValue={realName || ""} />
      </div>
      <div>
        <label className="text-sm">统一联系方式（可选，会同步到你的账号发布）</label>
        <input className="field mt-1" name="contactInfo" placeholder="微信/QQ/电话" />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "保存中..." : "保存资料"}
      </button>
    </form>
  );
}