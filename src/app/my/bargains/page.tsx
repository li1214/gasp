import Link from "next/link";

import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

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

  return (
    <main className="shell space-y-4 pb-28">
      <section className="app-card hero-gradient p-5">
        <h1 className="text-xl font-bold text-white">我的砍价</h1>
        <p className="text-sm text-white/85 mt-1">集中查看收到的砍价和你发起的砍价。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 px-1">收到的砍价</h2>
        {receivedBargains.map((item: any) => (
          <article key={item.id} className="app-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.listing.title}</p>
                <p className="text-xs text-slate-500 mt-1">买家：{item.user.nickname}（{item.user.phone}）</p>
              </div>
              <p className="text-base font-bold text-[#1f5fc6]">¥{formatPrice(item.listing.priceCents)}</p>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>账号状态：{item.listing.status}</p>
              <p>砍价留言：{item.message || "（无留言）"}</p>
              <p>砍价时间：{cnDate(item.createdAt)}</p>
            </div>

            <Link className="btn btn-outline" href={`/listing/${item.listing.id}`}>
              查看账号
            </Link>
          </article>
        ))}
        {receivedBargains.length === 0 ? (
          <section className="app-card p-6 text-center text-slate-500">暂无收到的砍价</section>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 px-1">我的砍价</h2>
        {myBargains.map((item: any) => (
          <article key={item.id} className="app-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.listing.title}</p>
                <p className="text-xs text-slate-500 mt-1">卖家：{item.listing.seller.nickname}（{item.listing.seller.phone}）</p>
              </div>
              <p className="text-base font-bold text-[#1f5fc6]">¥{formatPrice(item.listing.priceCents)}</p>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>账号状态：{item.listing.status}</p>
              <p>我的留言：{item.message || "（无留言）"}</p>
              <p>提交时间：{cnDate(item.createdAt)}</p>
            </div>

            <Link className="btn btn-outline" href={`/listing/${item.listing.id}`}>
              查看账号
            </Link>
          </article>
        ))}
        {myBargains.length === 0 ? (
          <section className="app-card p-6 text-center text-slate-500">你还没有发起过砍价</section>
        ) : null}
      </section>
    </main>
  );
}
