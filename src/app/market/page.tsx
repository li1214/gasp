import Link from "next/link";
import { ListingAccountType, ListingStatus, Prisma } from "@prisma/client";

import { MarketFilterForm } from "@/components/market-filter-form";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type MarketProps = {
  searchParams: {
    accountType?: string;
    supportBargain?: string;
    hasBigTransfer?: string;
    minPrice?: string;
    maxPrice?: string;
    keyword?: string;
    serverName?: string;
  };
};

function parseNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBool(value: string | undefined) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default async function MarketPage({ searchParams }: MarketProps) {
  const minPrice = parseNumber(searchParams.minPrice);
  const maxPrice = parseNumber(searchParams.maxPrice);
  const supportBargain = parseBool(searchParams.supportBargain);
  const hasBigTransfer = parseBool(searchParams.hasBigTransfer);
  const serverName = searchParams.serverName?.trim();

  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.APPROVED,
    accountType:
      searchParams.accountType === ListingAccountType.LINGXI_OFFICIAL ||
      searchParams.accountType === ListingAccountType.CHANNEL
        ? (searchParams.accountType as ListingAccountType)
        : undefined,
    supportBargain,
    hasBigTransfer,
    title: searchParams.keyword
      ? {
          contains: searchParams.keyword
        }
      : undefined,
    serverName: serverName
      ? {
          contains: serverName
        }
      : undefined,
    priceCents: {
      gte: minPrice ? minPrice * 100 : undefined,
      lte: maxPrice ? maxPrice * 100 : undefined
    }
  };

  const listings = await prisma.listing.findMany({
    where,
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
    take: 100
  });

  return (
    <main className="shell space-y-4">
      <MarketFilterForm
        keyword={searchParams.keyword}
        accountType={searchParams.accountType}
        supportBargain={searchParams.supportBargain}
        hasBigTransfer={searchParams.hasBigTransfer}
        minPrice={searchParams.minPrice}
        maxPrice={searchParams.maxPrice}
        serverName={searchParams.serverName}
      />

      <section className="compact-list">
        {listings.map((item: any) => {
          const image =
            item.coverImageUrl ||
            item.images[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900";

          return (
            <Link key={item.id} href={`/listing/${item.id}`} className="listing-compact-card listing-compact-link">
              <img className="listing-compact-image" src={image} alt={item.title} />
              <div className="listing-compact-main">
                <h2 className="listing-compact-title">{item.title}</h2>
                <div className="listing-compact-tags">
                  <span className="badge">{item.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"}</span>
                </div>
                <p className="listing-compact-meta">赛季服：{item.seasonServer || "-"} · 服务器：{item.serverName || "-"}</p>
                <div className="listing-compact-foot">
                  <p className="listing-compact-price">¥{formatPrice(item.priceCents)}</p>
                  <span className="btn !py-1.5 !px-3 text-xs">查看详情</span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {listings.length === 0 ? <section className="app-card p-8 text-center text-slate-500">暂无符合条件的账号</section> : null}
    </main>
  );
}
