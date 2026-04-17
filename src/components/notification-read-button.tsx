"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  notificationId: string;
  isRead: boolean;
};

type ApiResult = {
  error?: string;
};

async function readResponseJson<T = any>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function NotificationReadButton({ notificationId, isRead }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isRead) {
    return (
      <span className="badge !h-7 !px-3 !text-xs border-[#cfe0ee] bg-[#f6fbff] text-[#3e5b7f]">
        已读
      </span>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-outline min-h-[44px] inline-flex items-center gap-1.5"
      disabled={loading}
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: "PATCH"
        });
        const result = await readResponseJson<ApiResult>(response);
        setLoading(false);

        if (!response.ok) {
          window.alert(result?.error || `操作失败（${response.status}）`);
          return;
        }

        router.refresh();
      }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {loading ? "处理中" : "标记已读"}
    </button>
  );
}
