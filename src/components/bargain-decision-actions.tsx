"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BargainStatus = "PENDING" | "ACCEPTED" | "REJECTED";
type ActionType = "ACCEPTED" | "REJECTED";

type Props = {
  bargainId: string;
  status: BargainStatus;
};

type ActionResult = {
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

export function BargainDecisionActions({ bargainId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<ActionType | "">("");

  if (status !== "PENDING") {
    return null;
  }

  async function handleAction(nextStatus: ActionType) {
    if (loading) {
      return;
    }

    const actionText = nextStatus === "ACCEPTED" ? "同意" : "拒绝";
    const confirmed = window.confirm(`确认要${actionText}这条砍价申请吗？`);
    if (!confirmed) {
      return;
    }

    setLoading(nextStatus);
    const response = await fetch(`/api/bargains/${bargainId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const result = await readResponseJson<ActionResult>(response);
    setLoading("");

    if (!response.ok) {
      window.alert(result?.error || `操作失败（${response.status}）`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        className="btn !bg-[#149064] !border-[#149064] min-h-[44px] inline-flex items-center justify-center gap-1.5"
        disabled={!!loading}
        onClick={() => handleAction("ACCEPTED")}
      >
        {loading === "ACCEPTED" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        {loading === "ACCEPTED" ? "处理中" : "同意砍价"}
      </button>

      <button
        type="button"
        className="btn btn-outline !border-[#e9b8bd] !text-[#9a2f3e] !bg-[#fff3f5] min-h-[44px] inline-flex items-center justify-center gap-1.5"
        disabled={!!loading}
        onClick={() => handleAction("REJECTED")}
      >
        {loading === "REJECTED" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
        {loading === "REJECTED" ? "处理中" : "拒绝砍价"}
      </button>
    </div>
  );
}
