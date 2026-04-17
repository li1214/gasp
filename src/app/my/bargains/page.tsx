import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleSlash, Clock3, MessageCircleQuestion, XCircle } from "lucide-react";

import { BargainDecisionActions } from "@/components/bargain-decision-actions";
import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const BARGAIN_STATUS_LABEL: Record<string, string> = {
  PENDING: "待处理",
  ACCEPTED: "已同意",
  REJECTED: "已拒绝"
};

function statusTone(status: string) {
  if (status === "ACCEPTED") {
    return "border-[#b7e3c7] bg-[#ecfff2] text-[#18633a]";
  }
  if (status === "REJECTED") {
    return "border-[#f2bfbd] bg-[#fff1f1] text-[#952f31]";
  }
  return "border-[#f2db9c] bg-[#fff7df] text-[#8a6212]";
}

export default async function MyBargainsPage() {
  const user = await requireUser();

  const [receivedBargains, myBargains] = await Promise.all([
    prisma.bargain.findMany({
      where: {
        listing: {
          sellerId: user.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            priceCents: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.bargain.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            priceCents: true,
            status: true,
            seller: {
              select: {
                nickname: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);

  const pendingReceivedCount = receivedBargains.filter((item: any) => item.status === "PENDING").length;
  const acceptedMyCount = myBargains.filter((item: any) => item.status === "ACCEPTED").length;

  return (
    <main className="shell space-y-5 pb-28">
      <section className="app-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_12%,rgba(83,133,232,0.24),transparent_48%),radial-gradient(circle_at_92%_4%,rgba(44,191,154,0.22),transparent_46%),linear-gradient(135deg,#fefefe_0%,#f2f7ff_60%,#ecfffa_100%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bargain Desk</p>
          <h1 className="text-2xl font-black text-slate-900 mt-2">我的砍价</h1>
          <p className="text-sm text-slate-600 mt-2">这里可以处理别人对你账号的砍价申请，也能追踪你发起砍价的处理结果。</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <article className="app-card p-3">
          <p className="text-[11px] text-slate-500">收到砍价</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{receivedBargains.length}</p>
        </article>
        <article className="app-card p-3">
          <p className="text-[11px] text-slate-500">待处理</p>
          <p className="text-2xl font-black text-[#f08a19] mt-1">{pendingReceivedCount}</p>
        </article>
        <article className="app-card p-3">
          <p className="text-[11px] text-slate-500">我方已同意</p>
          <p className="text-2xl font-black text-[#138559] mt-1">{acceptedMyCount}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 px-1">收到的砍价</h2>
          {receivedBargains.map((item: any) => (
            <article key={item.id} className="app-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.listing.title}</p>
                  <p className="text-xs text-slate-500 mt-1">买家：{item.user.nickname}（{item.user.phone}）</p>
                </div>
                <p className="text-lg font-black text-[#1f5fc6] whitespace-nowrap">¥{formatPrice(item.listing.priceCents)}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge !h-7 !px-3 !text-xs border ${statusTone(item.status)}`}>
                  {item.status === "PENDING" ? <Clock3 size={13} className="mr-1" /> : null}
                  {item.status === "ACCEPTED" ? <CheckCircle2 size={13} className="mr-1" /> : null}
                  {item.status === "REJECTED" ? <XCircle size={13} className="mr-1" /> : null}
                  {BARGAIN_STATUS_LABEL[item.status] || item.status}
                </span>
                <span className="badge !h-7 !px-3 !text-xs">账号状态：{item.listing.status}</span>
              </div>

              <div className="rounded-xl border border-[#dbe7f8] bg-[#f8fbff] p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-700">砍价留言</p>
                <p className="mt-1 leading-relaxed">{item.message || "（无留言）"}</p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>砍价时间：{cnDate(item.createdAt)}</p>
                {item.handledAt ? <p>处理时间：{cnDate(item.handledAt)}</p> : null}
              </div>

              <BargainDecisionActions bargainId={item.id} status={item.status} />

              <Link className="btn btn-outline min-h-[44px] inline-flex items-center gap-1.5 mt-1" href={`/listing/${item.listing.id}`}>
                查看账号
                <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
          {receivedBargains.length === 0 ? (
            <section className="app-card p-8 text-center text-slate-500">
              <div className="w-11 h-11 mx-auto rounded-xl bg-[#eef4ff] text-[#1f5fc6] grid place-items-center">
                <MessageCircleQuestion size={18} />
              </div>
              <p className="font-medium text-slate-700 mt-3">暂无收到的砍价</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 px-1">我发起的砍价</h2>
          {myBargains.map((item: any) => (
            <article key={item.id} className="app-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.listing.title}</p>
                  <p className="text-xs text-slate-500 mt-1">卖家：{item.listing.seller.nickname}（{item.listing.seller.phone}）</p>
                </div>
                <p className="text-lg font-black text-[#1f5fc6] whitespace-nowrap">¥{formatPrice(item.listing.priceCents)}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge !h-7 !px-3 !text-xs border ${statusTone(item.status)}`}>
                  {item.status === "PENDING" ? <Clock3 size={13} className="mr-1" /> : null}
                  {item.status === "ACCEPTED" ? <CheckCircle2 size={13} className="mr-1" /> : null}
                  {item.status === "REJECTED" ? <CircleSlash size={13} className="mr-1" /> : null}
                  {BARGAIN_STATUS_LABEL[item.status] || item.status}
                </span>
                <span className="badge !h-7 !px-3 !text-xs">账号状态：{item.listing.status}</span>
              </div>

              <div className="rounded-xl border border-[#dbe7f8] bg-[#f8fbff] p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-700">我的留言</p>
                <p className="mt-1 leading-relaxed">{item.message || "（无留言）"}</p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>提交时间：{cnDate(item.createdAt)}</p>
                {item.handledAt ? <p>处理时间：{cnDate(item.handledAt)}</p> : null}
              </div>

              <Link className="btn btn-outline min-h-[44px] inline-flex items-center gap-1.5 mt-1" href={`/listing/${item.listing.id}`}>
                查看账号
                <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
          {myBargains.length === 0 ? (
            <section className="app-card p-8 text-center text-slate-500">
              <div className="w-11 h-11 mx-auto rounded-xl bg-[#eef4ff] text-[#1f5fc6] grid place-items-center">
                <MessageCircleQuestion size={18} />
              </div>
              <p className="font-medium text-slate-700 mt-3">你还没有发起过砍价</p>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
