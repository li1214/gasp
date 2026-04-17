"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserRoleSelect({
  userId,
  role
}: {
  userId: string;
  role: "USER" | "ADMIN";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <select
      className="field !py-2.5 !text-xs min-h-[44px]"
      value={role}
      disabled={loading}
      onChange={async (event) => {
        setLoading(true);
        await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: event.target.value })
        });
        setLoading(false);
        router.refresh();
      }}
    >
      <option value="USER">普通用户</option>
      <option value="ADMIN">管理员</option>
    </select>
  );
}
