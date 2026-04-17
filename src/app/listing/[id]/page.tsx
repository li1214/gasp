import { notFound } from "next/navigation";

import { ListingActionBar } from "@/components/listing-action-bar";
import { ListingDetailGallery } from "@/components/listing-detail-gallery";
import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

function valueText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

export default async function ListingDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const [listing, siteConfig] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" }
        },
        audits: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        favorites: user
          ? {
              where: {
                userId: user.id
              },
              take: 1
            }
          : false
      }
    }),
    prisma.siteConfig.findUnique({ where: { id: 1 } })
  ]);

  if (!listing) {
    notFound();
  }

  const isOwner = user?.id === listing.sellerId;
  const isAdmin = user?.role === "ADMIN";

  if (listing.status !== "APPROVED" && !isOwner && !isAdmin) {
    notFound();
  }

  const detailImages = listing.images.length ? listing.images : [{ imageUrl: listing.coverImageUrl }];

  return (
    <main className="shell space-y-4 pb-6">
      <article className="app-card overflow-hidden">
        <img className="h-64 w-full object-cover" src={listing.coverImageUrl} alt={listing.title} />

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500">编号：{listing.id.slice(-8).toUpperCase()}</p>
              <h1 className="text-xl font-bold leading-8 mt-1">{listing.title}</h1>
            </div>
            <p className="text-2xl font-bold text-[#1f5fc6]">¥{formatPrice(listing.priceCents)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge">{listing.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"}</span>
            <span className="badge">{listing.supportBargain ? "可砍价" : "不议价"}</span>
            <span className="badge">{listing.hasBigTransfer ? "支持大跨" : "无大跨"}</span>
            <span className="badge">收藏 {listing.favoriteCount}</span>
            <span className="badge">浏览 {listing.viewCount}</span>
          </div>

          <ListingActionBar
            listingId={listing.id}
            supportBargain={listing.supportBargain}
            isLoggedIn={!!user}
            defaultFavorited={Array.isArray(listing.favorites) && listing.favorites.length > 0}
            defaultFavoriteCount={listing.favoriteCount}
            customerServiceUrl={siteConfig?.customerServiceUrl || ""}
            userGroupUrl={siteConfig?.userGroupUrl || ""}
          />

          <section className="grid grid-cols-2 gap-2 text-sm rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p>赛季开始：{listing.seasonStartDate ? cnDate(listing.seasonStartDate) : "-"}</p>
            <p>赛季服：{valueText(listing.seasonServer)}</p>
            <p>服务器：{valueText(listing.serverName)}</p>
            <p>主将等级：{valueText(listing.commanderLevel)}</p>
            <p>玉璧数量：{valueText(listing.jadeCount)}</p>
            <p>金猪数量：{valueText(listing.goldPigCount)}</p>
            <p>橙将数量：{valueText(listing.orangeGeneralCount)}</p>
            <p>典藏武将：{valueText(listing.collectionGeneralCount)}</p>
            <p>俊采值：{valueText(listing.juncaiValue)}</p>
            <p>武将皮肤：{valueText(listing.heroSkinCount)}</p>
            <p>行军特效：{valueText(listing.marchEffect)}</p>
            <p>主城外观：{valueText(listing.mainCityAppearance)}</p>
            <p>橙装数量：{valueText(listing.orangeEquipmentCount)}</p>
            <p>S战法数量：{valueText(listing.sTacticCount)}</p>
          </section>

          <ListingDetailGallery title={listing.title} imageUrls={detailImages.map((image: any) => image.imageUrl)} />

          {listing.constructionDesc ? (
            <section>
              <p className="font-semibold text-sm">营造描述</p>
              <div className="mt-1 rounded-xl border border-slate-200 bg-white p-3 text-sm whitespace-pre-wrap leading-6">
                {listing.constructionDesc}
              </div>
            </section>
          ) : null}

          {listing.description ? (
            <section>
              <p className="font-semibold text-sm">详细描述</p>
              <div className="mt-1 rounded-xl border border-slate-200 bg-white p-3 text-sm whitespace-pre-wrap leading-6">
                {listing.description}
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-semibold">平台声明</p>
            <p className="mt-1">本平台仅做账号信息展示，不参与交易，请注意资金安全与个人信息保护。</p>
          </section>

          <div className="text-xs text-slate-500">
            <p>状态：{listing.status}</p>
            <p>发布时间：{listing.publishedAt ? cnDate(listing.publishedAt) : "未上架"}</p>
            {listing.rejectReason ? <p>驳回原因：{listing.rejectReason}</p> : null}
          </div>
        </div>
      </article>
    </main>
  );
}
