"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserStatusSelect({
  userId,
  status
}: {
  userId: string;
  status: "ACTIVE" | "BANNED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <select
      className="field !py-2.5 !text-xs min-h-[44px]"
      value={status}
      disabled={loading}
      onChange={async (event) => {
        setLoading(true);
        await fetch(`/api/admin/users/${userId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: event.target.value })
        });
        setLoading(false);
        router.refresh();
      }}
    >
      <option value="ACTIVE">正常</option>
      <option value="BANNED">封禁</option>
    </select>
  );
}
