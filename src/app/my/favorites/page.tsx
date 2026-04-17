import Link from "next/link";
import { ArrowUpRight, Eye, Heart, Sparkles } from "lucide-react";
import Image from "next/image";

import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listingStatusLabel } from "@/lib/status-label";

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

  const availableCount = favorites.filter((item: any) => item.listing?.status === "APPROVED").length;
  const soldCount = favorites.filter((item: any) => item.listing?.status === "SOLD").length;

  return (
    <main className="shell space-y-5 pb-28">
      <section className="app-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_10%,rgba(75,132,232,0.24),transparent_48%),radial-gradient(circle_at_90%_10%,rgba(29,186,141,0.2),transparent_46%),linear-gradient(132deg,#fefefe_0%,#f1f7ff_58%,#ecfff8_100%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">My Favorites</p>
          <h1 className="text-2xl font-black text-slate-900 mt-2">我的收藏</h1>
          <p className="text-sm text-slate-600 mt-2">收藏列表已为你按时间倒序整理，支持快速回到详情页并查看热度变化。</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <article className="app-card p-3">
          <p className="text-[11px] text-slate-500">总收藏</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{favorites.length}</p>
        </article>
        <article className="app-card p-3">
          <p className="text-[11px] text-slate-500">在售可看</p>
          <p className="text-2xl font-black text-[#1f5fc6] mt-1">{availableCount}</p>
        </article>
        <article className="app-card p-3">
          <p className="text-[11px] text-slate-500">已售出</p>
          <p className="text-2xl font-black text-[#0f8a5f] mt-1">{soldCount}</p>
        </article>
      </section>

      {favorites.length === 0 ? (
        <section className="app-card p-9 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#edf4ff] text-[#1f5fc6] grid place-items-center">
            <Heart size={20} />
          </div>
          <p className="text-slate-700 font-semibold mt-4">你还没有收藏任何账号</p>
          <p className="text-slate-500 text-sm mt-2">去市场页逛逛，看到心仪账号一键收藏。</p>
          <Link className="btn mt-5 inline-flex items-center gap-1.5" href="/market">
            去市场看看
            <ArrowUpRight size={15} />
          </Link>
        </section>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((item: any) => {
        const listing = item.listing;
        const statusLabel = listingStatusLabel(listing.status);
        const statusTone =
          listing.status === "APPROVED"
            ? "border-[#b5dfc8] bg-[#ecfff3] text-[#17613b]"
            : listing.status === "SOLD"
              ? "border-[#b6d7e5] bg-[#ebf9ff] text-[#155e7b]"
              : "border-[#d5deec] bg-[#f4f7fd] text-[#3f577a]";

        return (
          <article
            key={item.id}
            className="app-card p-3 md:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(20,54,109,0.12)]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#d7e4f7] h-[160px] md:h-[176px]">
              <Image
                src={listing.coverImageUrl}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f40]/75 via-[#0c1f40]/15 to-transparent" />
              <div className="absolute left-3 right-3 bottom-3 flex items-end justify-between gap-3 text-white">
                <div className="min-w-0">
                  <p className="font-semibold leading-snug line-clamp-2">{listing.title}</p>
                  <p className="text-xs text-white/90 mt-1 inline-flex items-center gap-1.5">
                    <Sparkles size={13} />
                    {listing.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"} · {listing.hasBigTransfer ? "有大跨" : "无大跨"}
                  </p>
                </div>
                <p className="text-lg font-black whitespace-nowrap">¥{formatPrice(listing.priceCents)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center flex-wrap gap-2">
              <span className={`badge !h-7 !px-3 !text-xs border ${statusTone}`}>{statusLabel}</span>
              <span className="badge !h-7 !px-3 !text-xs inline-flex gap-1.5">
                <Heart size={13} />
                收藏 {listing.favoriteCount}
              </span>
              <span className="badge !h-7 !px-3 !text-xs inline-flex gap-1.5">
                <Eye size={13} />
                浏览 {listing.viewCount}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-3 space-y-1.5">
              <p>发布时间：{listing.publishedAt ? cnDate(listing.publishedAt) : "未上架"}</p>
              <p>收藏时间：{cnDate(item.createdAt)}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="btn min-h-[44px] inline-flex items-center gap-1.5" href={`/listing/${listing.id}`}>
                查看详情
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        );
        })}
      </section>
    </main>
  );
}
