import Link from "next/link";

import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function MyFavoritesPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          coverImageUrl: true,
          priceCents: true,
          accountType: true,
          hasBigTransfer: true,
          status: true,
          publishedAt: true,
          favoriteCount: true,
          viewCount: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <main className="shell space-y-4 pb-28">
      <section className="app-card hero-gradient p-5">
        <h1 className="text-xl font-bold text-white">我的收藏</h1>
        <p className="text-sm text-white/85 mt-1">查看你收藏过的账号，快速回到详情页。</p>
      </section>

      {favorites.map((item: any) => {
        const listing = item.listing;
        return (
          <article key={item.id} className="app-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{listing.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {listing.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"} · {listing.hasBigTransfer ? "有大跨" : "无大跨"}
                </p>
              </div>
              <p className="text-lg font-bold text-[#1f5fc6]">¥{formatPrice(listing.priceCents)}</p>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>状态：{listing.status}</p>
              <p>发布时间：{listing.publishedAt ? cnDate(listing.publishedAt) : "未上架"}</p>
              <p>收藏/浏览：{listing.favoriteCount} / {listing.viewCount}</p>
              <p>收藏时间：{cnDate(item.createdAt)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-outline" href={`/listing/${listing.id}`}>
                查看详情
              </Link>
            </div>
          </article>
        );
      })}

      {favorites.length === 0 ? (
        <section className="app-card p-8 text-center text-slate-500">你还没有收藏任何账号</section>
      ) : null}
    </main>
  );
}
