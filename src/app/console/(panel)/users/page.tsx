import { redirect } from "next/navigation";

import { UserRoleSelect } from "@/components/user-role-select";
import { UserStatusSelect } from "@/components/user-status-select";
import { cnDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { userStatusLabel } from "@/lib/status-label";

function roleLabel(role: "USER" | "ADMIN") {
  return role === "ADMIN" ? "管理员" : "普通用户";
}

function statusBadgeClass(status: "ACTIVE" | "BANNED") {
  return status === "ACTIVE" ? "console-badge approved" : "console-badge rejected";
}

export default async function ConsoleUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/console/login");
  }

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          listings: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 300
  });

  return (
    <section className="console-page">
      <header className="console-page-header">
        <h1 className="console-page-title">用户与权限管理</h1>
        <p className="console-page-desc">支持账号状态封禁/解禁、角色分配、实名状态查看和发布行为管理。</p>
      </header>

      <section className="console-panel">
        <header className="console-panel-head">
          <h2 className="text-sm font-semibold text-slate-700">用户列表</h2>
        </header>

        <div className="console-panel-body lg:hidden space-y-3">
          {users.map((item: any) => (
            <article key={item.id} className="console-mobile-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{item.nickname}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.phone}</p>
                </div>
                <span className={statusBadgeClass(item.status)}>{userStatusLabel(item.status)}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className={item.verifiedAt ? "console-badge approved" : "console-badge pending"}>
                  {item.verifiedAt ? "已实名" : "未实名"}
                </span>
                <span className="console-badge">{roleLabel(item.role)}</span>
                <span className="console-badge">发布 {item._count.listings}</span>
              </div>

              <p className="text-xs text-slate-500 mt-3">注册时间：{cnDate(item.createdAt)}</p>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">角色调整</p>
                  <UserRoleSelect userId={item.id} role={item.role} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">状态调整</p>
                  <UserStatusSelect userId={item.id} status={item.status} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden lg:block console-panel-body console-table-wrap">
          <table className="console-table">
            <thead>
              <tr>
                <th>昵称</th>
                <th>手机号</th>
                <th>实名状态</th>
                <th>角色</th>
                <th>账号状态</th>
                <th>发布数</th>
                <th>注册时间</th>
                <th>角色调整</th>
                <th>状态调整</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item: any) => (
                <tr key={item.id}>
                  <td className="font-medium text-slate-800">{item.nickname}</td>
                  <td>{item.phone}</td>
                  <td>
                    <span className={item.verifiedAt ? "console-badge approved" : "console-badge pending"}>
                      {item.verifiedAt ? "已实名" : "未实名"}
                    </span>
                  </td>
                  <td>
                    <span className="console-badge">{roleLabel(item.role)}</span>
                  </td>
                  <td>
                    <span className={statusBadgeClass(item.status)}>{userStatusLabel(item.status)}</span>
                  </td>
                  <td>{item._count.listings}</td>
                  <td>{cnDate(item.createdAt)}</td>
                  <td>
                    <UserRoleSelect userId={item.id} role={item.role} />
                  </td>
                  <td>
                    <UserStatusSelect userId={item.id} status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
