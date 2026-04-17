import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ListingStatus } from "@prisma/client";

import { HomeCarousel } from "@/components/home-carousel";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [recommendedListings, listings] = await Promise.all([
    prisma.listing.findMany({
      where: {
        status: ListingStatus.APPROVED,
        isRecommended: true
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1
        }
      },
      orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
      take: 10
    }),
    prisma.listing.findMany({
      where: {
        status: ListingStatus.APPROVED
      },
      include: {
        seller: {
          select: {
            nickname: true
          }
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1
        }
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 18
    })
  ]);

  const recommends = recommendedListings.map((item) => ({
    id: item.id,
    title: item.title,
    priceText: formatPrice(item.priceCents),
    imageUrl:
      item.coverImageUrl ||
      item.images[0]?.imageUrl ||
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200",
    accountTypeLabel: item.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服",
    hasBigTransfer: item.hasBigTransfer
  }));

  return (
    <main className="shell space-y-4">
      <section className="app-card hero-gradient p-5 mt-1">
        <p className="text-xs text-white/80">移动端账号展示平台</p>
        <h1 className="text-2xl font-bold mt-1">三国志战略版账号广场</h1>
        <p className="text-sm text-white/85 mt-1">精选推荐与最新上架，筛选检索请进入检索页。</p>
      </section>

      <HomeCarousel items={recommends} />

      <section className="app-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold inline-flex items-center gap-2">
            <Sparkles size={16} /> 最新上架
          </h2>
          <Link href="/market" className="icon-chip">
            查看全部
          </Link>
        </div>

        <div className="compact-list">
          {listings.slice(0, 12).map((item: any) => {
            const image =
              item.coverImageUrl ||
              item.images[0]?.imageUrl ||
              "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900";
            return (
              <Link key={item.id} href={`/listing/${item.id}`} className="listing-compact-card listing-compact-link">
                <img className="listing-compact-image" src={image} alt={item.title} />
                <div className="listing-compact-main">
                  <h3 className="listing-compact-title">{item.title}</h3>
                  <div className="listing-compact-tags">
                    <span className="badge">{item.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"}</span>
                  </div>
                  <p className="listing-compact-meta">赛季服：{item.seasonServer || "-"} · 服务器：{item.serverName || "-"}</p>
                  <div className="listing-compact-foot">
                    <p className="listing-compact-price">¥{formatPrice(item.priceCents)}</p>
                    <span className="btn !px-3 !py-1.5 text-xs">详情</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
