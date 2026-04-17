"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileTabbar } from "@/components/mobile-tabbar";

type UserLite = {
  id: string;
  role: "USER" | "ADMIN";
} | null;

export function RootChrome({
  user,
  children
}: {
  user: UserLite;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isConsole = pathname.startsWith("/console") || pathname.startsWith("/admin");

  if (isConsole) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <span className="brand-logo" aria-hidden="true">
              <span className="brand-logo-core">战</span>
              <span className="brand-logo-ring" />
              <span className="brand-logo-glow" />
            </span>
            <span className="brand-copy">
              <span className="brand-title-row">
                <span className="brand-title">三国志·战略版 账号展示</span>
                {/* <span className="brand-chip">APP</span> */}
              </span>
              <span className="brand-sub">仅展示账号信息 · 平台不参与交易</span>
            </span>
          </Link>
          <span className="header-status">实时上新</span>
        </div>
      </header>

      <div className="site-content">{children}</div>

      <MobileTabbar isLoggedIn={!!user} />
    </>
  );
}
