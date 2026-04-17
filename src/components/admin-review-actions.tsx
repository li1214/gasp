"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReviewActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function submit(action: "APPROVE" | "REJECT" | "OFFLINE") {
    const reason =
      action === "REJECT"
        ? window.prompt("请输入驳回原因", "信息不完整，请补充关键截图") || "信息不完整"
        : "";

    setLoading(action);

    try {
      const response = await fetch(`/api/admin/listings/${listingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="admin-action-group">
      <button className="admin-action-btn primary" disabled={!!loading} onClick={() => submit("APPROVE")}>
        {loading === "APPROVE" ? "处理中" : "通过"}
      </button>
      <button className="admin-action-btn" disabled={!!loading} onClick={() => submit("REJECT")}>
        {loading === "REJECT" ? "处理中" : "驳回"}
      </button>
      <button className="admin-action-btn" disabled={!!loading} onClick={() => submit("OFFLINE")}>
        {loading === "OFFLINE" ? "处理中" : "下架"}
      </button>
    </div>
  );
}
