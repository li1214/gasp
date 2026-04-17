"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: string;
  recommended: boolean;
};

async function readJsonSafe(response: Response): Promise<{ error?: string } | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as { error?: string };
  } catch {
    return null;
  }
}

export function AdminListingRecommendButton({ listingId, recommended }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onToggle() {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/listings/${listingId}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recommended: !recommended })
      });

      const result = await readJsonSafe(response);
      if (!response.ok) {
        window.alert(result?.error || `操作失败（${response.status}）`);
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`admin-action-btn ${recommended ? "primary" : ""}`}
      disabled={loading}
      onClick={onToggle}
      title={recommended ? "取消推荐" : "设为推荐"}
    >
      {loading ? "处理中" : recommended ? "已推荐" : "设推荐"}
    </button>
  );
}
