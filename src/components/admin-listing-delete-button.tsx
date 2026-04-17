"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: string;
  title: string;
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

export function AdminListingDeleteButton({ listingId, title }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(`确认删除账号「${title}」？\n删除后无法恢复。`);
    if (!ok) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "DELETE"
      });

      const result = await readJsonSafe(response);
      if (!response.ok) {
        window.alert(result?.error || `删除失败（${response.status}）`);
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
      className="admin-action-btn danger"
      onClick={onDelete}
      disabled={loading}
      title="删除账号"
    >
      {loading ? "删除中" : "删除"}
    </button>
  );
}
