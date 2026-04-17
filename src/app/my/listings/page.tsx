import Link from "next/link";

import { ListingOwnerActions } from "@/components/listing-owner-actions";
import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function MyListingsPage() {
  const user = await requireUser();

  const listings = await prisma.listing.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="shell space-y-4 pb-28">
      <section className="app-card hero-gradient p-5">
        <h1 className="text-xl font-bold text-white">我的发布</h1>
        <p className="text-sm text-white/85 mt-1">查看审核状态、上下架、重新提交。</p>
      </section>

      {listings.map((item: any) => (
        <article key={item.id} className="app-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {item.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"} · {item.hasBigTransfer ? "有大跨" : "无大跨"}
              </p>
            </div>
            <p className="text-lg font-bold text-[#1f5fc6]">¥{formatPrice(item.priceCents)}</p>
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
            <p>主将等级：{item.commanderLevel ?? "-"}</p>
            <p>橙将：{item.orangeGeneralCount ?? "-"}</p>
            <p>典藏武将：{item.collectionGeneralCount ?? "-"}</p>
            <p>S战法：{item.sTacticCount ?? "-"}</p>
          </div>

          <div className="text-xs text-slate-500">
            <p>状态：{item.status}</p>
            <p>创建：{cnDate(item.createdAt)}</p>
            {item.rejectReason ? <p>驳回：{item.rejectReason}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-outline" href={`/listing/${item.id}`}>
              查看详情
            </Link>
            <ListingOwnerActions listingId={item.id} status={item.status} />
          </div>
        </article>
      ))}

      {listings.length === 0 ? (
        <section className="app-card p-8 text-center text-slate-500">你还没有发布任何账号</section>
      ) : null}
    </main>
  );
}