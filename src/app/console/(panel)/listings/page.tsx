import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingAccountType, ListingStatus, Prisma } from "@prisma/client";

import { AdminListingDeleteButton } from "@/components/admin-listing-delete-button";
import { AdminListingRecommendButton } from "@/components/admin-listing-recommend-button";
import { AdminReviewActions } from "@/components/admin-review-actions";
import { cnDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { listingStatusLabel } from "@/lib/status-label";

function statusLabel(status: string) {
  return listingStatusLabel(status);
}

function statusClass(status: string) {
  if (status === "PENDING") return "console-badge pending";
  if (status === "APPROVED") return "console-badge approved";
  if (status === "REJECTED") return "console-badge rejected";
  if (status === "OFFLINE") return "console-badge offline";
  if (status === "SOLD") return "console-badge sold";
  return "console-badge";
}

type ConsoleListingsProps = {
  searchParams?: {
    q?: string;
    status?: string;
    accountType?: string;
    recommended?: string;
  };
};

function valueOf(input: string | string[] | undefined) {
  if (Array.isArray(input)) return input[0] || "";
  return input || "";
}

export default async function ConsoleListingsPage({ searchParams }: ConsoleListingsProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/console/login");
  }

  const keyword = valueOf(searchParams?.q).trim();
  const statusRaw = valueOf(searchParams?.status);
  const accountTypeRaw = valueOf(searchParams?.accountType);
  const recommendedRaw = valueOf(searchParams?.recommended);

  const status = Object.values(ListingStatus).includes(statusRaw as ListingStatus)
    ? (statusRaw as ListingStatus)
    : undefined;

  const accountType =
    accountTypeRaw === ListingAccountType.LINGXI_OFFICIAL || accountTypeRaw === ListingAccountType.CHANNEL
      ? (accountTypeRaw as ListingAccountType)
      : undefined;
  const isRecommended =
    recommendedRaw === "true" ? true : recommendedRaw === "false" ? false : undefined;

  const where: Prisma.ListingWhereInput = {
    status,
    accountType,
    isRecommended,
    OR: keyword
      ? [
          { title: { contains: keyword } },
          { serverName: { contains: keyword } },
          { seasonServer: { contains: keyword } },
          { contactInfo: { contains: keyword } },
          { seller: { nickname: { contains: keyword } } },
          { seller: { phone: { contains: keyword } } }
        ]
      : undefined
  };

  const [listings, recommendedCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            nickname: true,
            phone: true
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 300
    }),
    prisma.listing.count({
      where: {
        status: ListingStatus.APPROVED,
        isRecommended: true
      }
    })
  ]);

  return (
    <section className="console-page">
      <header className="console-page-header">
        <h1 className="console-page-title">账号管理</h1>
        <p className="console-page-desc">
          支持按关键词、状态、账号类型搜索，可审核、编辑、删除账号。推荐账号当前 {recommendedCount}/10。
        </p>
      </header>

      <section className="console-panel">
        <header className="console-panel-head">
          <h2 className="text-sm font-semibold text-slate-700">账号列表（{listings.length}）</h2>
          <form method="get" className="console-filter-grid">
            <input
              className="field !py-2.5"
              name="q"
              defaultValue={keyword}
              placeholder="搜索标题/服务器/赛季服/卖家/联系方式"
            />
            <select className="field !py-2.5" name="status" defaultValue={statusRaw}>
              <option value="">全部状态</option>
              <option value="DRAFT">草稿</option>
              <option value="PENDING">待审核</option>
              <option value="APPROVED">已上架</option>
              <option value="REJECTED">已驳回</option>
              <option value="OFFLINE">已下架</option>
              <option value="SOLD">已售出</option>
            </select>
            <select className="field !py-2.5" name="accountType" defaultValue={accountTypeRaw}>
              <option value="">全部类型</option>
              <option value="LINGXI_OFFICIAL">灵犀官服</option>
              <option value="CHANNEL">渠道服</option>
            </select>
            <select className="field !py-2.5" name="recommended" defaultValue={recommendedRaw}>
              <option value="">全部推荐状态</option>
              <option value="true">仅推荐账号</option>
              <option value="false">仅非推荐账号</option>
            </select>
            <button className="btn !py-2.5 !px-3 text-xs min-h-[44px]" type="submit">
              搜索
            </button>
            <Link className="console-outline-btn justify-center !py-2.5 !px-3 min-h-[44px]" href="/console/listings">
              重置
            </Link>
          </form>
        </header>

        <div className="console-panel-body lg:hidden space-y-3">
          {listings.map((item: any) => (
            <article key={item.id} className="console-mobile-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 line-clamp-2">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    卖家：{item.seller.nickname}（{item.seller.phone}）
                  </p>
                </div>
                <p className="text-base font-black text-[#1f5fc6] whitespace-nowrap">¥{formatPrice(item.priceCents)}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                <span className="console-badge">{item.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"}</span>
                <span className="console-badge">{item.hasBigTransfer ? "有大跨" : "无大跨"}</span>
                <span className="console-badge">{item.supportBargain ? "可砍价" : "不议价"}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                <p>赛季服：{item.seasonServer || "-"}</p>
                <p>服务器：{item.serverName || "-"}</p>
                <p>更新时间：{cnDate(item.updatedAt)}</p>
                <div>
                  <AdminListingRecommendButton listingId={item.id} recommended={!!item.isRecommended} />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/console/listings/${item.id}/edit`} className="console-outline-btn min-h-[44px]">
                    编辑账号
                  </Link>
                  <AdminListingDeleteButton listingId={item.id} title={item.title} />
                </div>
                <AdminReviewActions listingId={item.id} />
              </div>
            </article>
          ))}
        </div>

        <div className="hidden lg:block console-panel-body console-table-wrap">
          <table className="console-table" style={{ minWidth: "1330px" }}>
            <thead>
              <tr>
                <th>标题</th>
                <th>卖家</th>
                <th>价格</th>
                <th>类型</th>
                <th>赛季服</th>
                <th>服务器</th>
                <th>状态</th>
                <th>推荐</th>
                <th>更新时间</th>
                <th>编辑</th>
                <th>审核</th>
                <th>删除</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <p className="font-medium line-clamp-2 text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.hasBigTransfer ? "有大跨" : "无大跨"} · {item.supportBargain ? "可砍价" : "不议价"}
                    </p>
                  </td>
                  <td>
                    <p>{item.seller.nickname}</p>
                    <p className="text-xs text-slate-500">{item.seller.phone}</p>
                  </td>
                  <td className="font-semibold text-slate-800">¥{formatPrice(item.priceCents)}</td>
                  <td>{item.accountType === "LINGXI_OFFICIAL" ? "灵犀官服" : "渠道服"}</td>
                  <td>{item.seasonServer || "-"}</td>
                  <td>{item.serverName || "-"}</td>
                  <td>
                    <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                  </td>
                  <td>
                    <AdminListingRecommendButton listingId={item.id} recommended={!!item.isRecommended} />
                  </td>
                  <td>{cnDate(item.updatedAt)}</td>
                  <td>
                    <Link href={`/console/listings/${item.id}/edit`} className="console-outline-btn">
                      编辑账号
                    </Link>
                  </td>
                  <td>
                    <AdminReviewActions listingId={item.id} />
                  </td>
                  <td>
                    <AdminListingDeleteButton listingId={item.id} title={item.title} />
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
