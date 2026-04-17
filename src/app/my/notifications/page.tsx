import Link from "next/link";
import { ArrowUpRight, BellRing, Clock3 } from "lucide-react";

import { NotificationReadButton } from "@/components/notification-read-button";
import { cnDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const TYPE_LABEL: Record<string, string> = {
  BARGAIN_ACCEPTED: "砍价同意",
  BARGAIN_REJECTED: "砍价拒绝",
  SYSTEM: "系统通知"
};

export default async function MyNotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main className="shell space-y-5 pb-28">
      <section className="app-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(81,132,233,0.24),transparent_46%),radial-gradient(circle_at_92%_8%,rgba(30,190,151,0.2),transparent_46%),linear-gradient(135deg,#ffffff_0%,#f2f8ff_62%,#edfffa_100%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inbox</p>
          <h1 className="text-2xl font-black text-slate-900 mt-2">站内消息</h1>
          <p className="text-sm text-slate-600 mt-2">砍价处理结果和系统提醒都会显示在这里。</p>
        </div>
      </section>

      {notifications.length === 0 ? (
        <section className="app-card p-9 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#edf4ff] text-[#1f5fc6] grid place-items-center">
            <BellRing size={20} />
          </div>
          <p className="text-slate-700 font-semibold mt-4">暂时没有消息</p>
          <p className="text-slate-500 text-sm mt-2">有新的砍价处理结果时，会第一时间通知你。</p>
        </section>
      ) : null}

      <section className="space-y-3">
        {notifications.map((item) => (
          <article key={item.id} className="app-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{TYPE_LABEL[item.type] || item.type}</p>
              </div>
              {item.isRead ? (
                <span className="badge !h-7 !px-3 !text-xs border-[#d5e3ef] bg-[#f5fbff] text-[#4c6788]">已读</span>
              ) : (
                <span className="badge !h-7 !px-3 !text-xs border-[#a9d5bd] bg-[#e9fff3] text-[#1c6f43]">未读</span>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>

            <div className="text-xs text-slate-500 inline-flex items-center gap-1.5">
              <Clock3 size={13} />
              {cnDate(item.createdAt)}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {item.listingId ? (
                <Link className="btn btn-outline min-h-[44px] inline-flex items-center gap-1.5" href={`/listing/${item.listingId}`}>
                  查看账号
                  <ArrowUpRight size={14} />
                </Link>
              ) : null}
              <NotificationReadButton notificationId={item.id} isRead={item.isRead} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
