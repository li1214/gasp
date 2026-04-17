import Link from "next/link";
import { BarChart3, Home, ListChecks, Shield, Users } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/session";

export default async function ConsoleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="console-root">
      <aside className="console-sidebar">
        <div>
          <Link href="/console" className="console-logo">SGZZ Console</Link>
          <p className="console-subtitle">三国志战略版账号展示平台后台</p>
        </div>

        <nav className="console-nav">
          <Link href="/console" className="console-link">
            <BarChart3 size={16} /> 数据总览
          </Link>
          <Link href="/console/users" className="console-link">
            <Users size={16} /> 用户与权限
          </Link>
          <Link href="/console/listings" className="console-link">
            <ListChecks size={16} /> 账号管理
          </Link>
          <Link href="/" className="console-link">
            <Home size={16} /> 返回前台
          </Link>
        </nav>

        <div className="console-user">
          <p className="text-xs text-slate-300">当前登录</p>
          <p className="text-sm font-semibold mt-1">{user?.nickname || "未登录"}</p>
          <p className="text-xs text-slate-300 mt-1 inline-flex items-center gap-1">
            <Shield size={12} /> {user?.role === "ADMIN" ? "管理员权限" : "普通权限"}
          </p>
          <div className="console-user-actions">
            <Link href="/my" className="icon-chip">个人中心</Link>
            <LogoutButton className="icon-chip" />
          </div>
        </div>
      </aside>

      <main className="console-main">{children}</main>
    </div>
  );
}
