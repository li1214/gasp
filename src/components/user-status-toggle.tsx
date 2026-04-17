"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserStatusToggle({
  userId,
  status
}: {
  userId: string;
  status: "ACTIVE" | "BANNED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const next = status === "ACTIVE" ? "BANNED" : "ACTIVE";

  return (
    <button
      className="btn btn-outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: next })
        });
        setLoading(false);
        if (response.ok) {
          router.refresh();
        }
      }}
    >
      {loading ? "处理中..." : next === "BANNED" ? "封禁" : "解禁"}
    </button>
  );
}
