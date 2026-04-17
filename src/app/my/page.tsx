import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  PlusSquare,
  UserPen
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/session";

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") {
    redirect("/auth/login");
  }

  const verified = Boolean(user.verifiedAt && user.realName && user.idCardNo);

  return (
    <main className="shell space-y-4">
      <section className="app-card hero-gradient p-5">
        <p className="text-xs text-white/80">个人中心</p>
        <h1 className="text-xl font-bold text-white mt-1">{user.nickname}</h1>
        <p className="text-sm text-white/85 mt-1">手机号：{user.phone}</p>
        <p className="text-xs text-white/80 mt-2">实名认证：{verified ? "已认证" : "未认证"}</p>
      </section>

      <section className="app-card p-3">
        <Link href="/publish" className="menu-row">
          <span className="menu-left"><PlusSquare size={17} /> 发布账号</span>
          <ChevronRight size={16} />
        </Link>

        <Link href="/realname?redirect=/publish" className="menu-row">
          <span className="menu-left"><BadgeCheck size={17} /> 实名认证</span>
          <span className="text-xs text-slate-500">{verified ? "已认证" : "去认证"}</span>
        </Link>

        <Link href="/my/listings" className="menu-row">
          <span className="menu-left"><PackageSearch size={17} /> 我的发布</span>
          <ChevronRight size={16} />
        </Link>

        <Link href="/my/profile" className="menu-row">
          <span className="menu-left"><UserPen size={17} /> 修改个人信息</span>
          <ChevronRight size={16} />
        </Link>

        <Link href="/my/security" className="menu-row">
          <span className="menu-left"><KeyRound size={17} /> 修改密码</span>
          <ChevronRight size={16} />
        </Link>

        {user.role === "ADMIN" ? (
          <Link href="/console" className="menu-row">
            <span className="menu-left"><LayoutDashboard size={17} /> 后台管理</span>
            <ChevronRight size={16} />
          </Link>
        ) : null}
      </section>

      <section className="app-card p-3">
        <div className="menu-row !border-b-0">
          <span className="menu-left"><LogOut size={17} /> 退出登录</span>
          <LogoutButton className="btn btn-outline !py-1.5 !px-3 !text-xs" />
        </div>
      </section>
    </main>
  );
}
