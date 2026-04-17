"use client";

import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className={className || "icon-chip"}
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        window.location.assign("/api/auth/logout?redirect=/");
      }}
    >
      {loading ? "退出中..." : "退出"}
    </button>
  );
}
