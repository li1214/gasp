import Link from "next/link";
import { redirect } from "next/navigation";
import { ListChecks, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function ConsoleDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/console/login");
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [users, admins, activeUsers, pending, approved, rejected, sold, newInWeek] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.listing.count({ where: { status: "APPROVED" } }),
      prisma.listing.count({ where: { status: "REJECTED" } }),
      prisma.listing.count({ where: { status: "SOLD" } }),
      prisma.listing.count({ where: { createdAt: { gte: sevenDaysAgo } } })
    ]);

  const cards = [
    { label: "用户总数", value: users },
    { label: "管理员数", value: admins },
    { label: "活跃用户", value: activeUsers },
    { label: "近7天新增账号", value: newInWeek },
    { label: "待审核账号", value: pending },
    { label: "已上架账号", value: approved },
    { label: "已驳回账号", value: rejected },
    { label: "已售出账号", value: sold }
  ];

  return (
    <section className="console-page">
      <header className="console-page-header">
        <h1 className="console-page-title">后台运营总览</h1>
        <p className="console-page-desc">查看账号发布审核、用户权限状态和平台运营数据，支持日常管理与异常排查。</p>
      </header>

      <section className="console-stat-grid">
        {cards.map((item) => (
          <article key={item.label} className="console-stat-card">
            <p className="console-stat-label">{item.label}</p>
            <p className="console-stat-value">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Link href="/console/listings" className="console-mobile-link">
          <ListChecks size={16} /> 进入账号管理
        </Link>
        <Link href="/console/users" className="console-mobile-link">
          <Users size={16} /> 进入用户管理
        </Link>
      </section>

      <section className="console-panel">
        <header className="console-panel-head">
          <h2 className="text-sm font-semibold text-slate-700">运营状态说明</h2>
        </header>
        <div className="console-panel-body text-sm text-slate-600 space-y-2">
          <p>待审核账号会进入账号管理页，由管理员执行通过、驳回或下架。</p>
          <p>用户与权限页面支持账号状态调整和管理员权限授予。</p>
          <p>建议每日关注近7天新增账号与待审核数量，避免审核积压。</p>
        </div>
      </section>
    </section>
  );
}
