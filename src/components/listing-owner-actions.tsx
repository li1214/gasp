"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingOwnerActions({
  listingId,
  status
}: {
  listingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function act(action: "OFFLINE" | "SOLD" | "RESUBMIT") {
    setLoading(action);
    const response = await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    setLoading("");

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "APPROVED" ? (
        <>
          <button className="btn btn-outline" onClick={() => act("OFFLINE")} disabled={!!loading}>
            {loading === "OFFLINE" ? "处理中..." : "下架"}
          </button>
          <button className="btn" onClick={() => act("SOLD")} disabled={!!loading}>
            {loading === "SOLD" ? "处理中..." : "标记已售"}
          </button>
        </>
      ) : null}
      {status === "REJECTED" || status === "OFFLINE" || status === "DRAFT" ? (
        <button className="btn" onClick={() => act("RESUBMIT")} disabled={!!loading}>
          {loading === "RESUBMIT" ? "处理中..." : "重新提交审核"}
        </button>
      ) : null}
    </div>
  );
}
