import Link from "next/link";
import { redirect } from "next/navigation";

import { ConsoleListingEditForm } from "@/components/console/listing-edit-form";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function ConsoleListingEditPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/console/login");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!listing) {
    redirect("/console/listings");
  }

  return (
    <section className="console-page">
      <header className="console-page-header">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="console-page-title">编辑账号信息</h1>
            <p className="console-page-desc">支持修改账号属性、替换封面/详情图，以及调整展示内容。</p>
          </div>
          <Link href="/console/listings" className="console-outline-btn">返回账号管理</Link>
        </div>
      </header>

      <ConsoleListingEditForm
        listing={{
          ...listing,
          seasonStartDate: listing.seasonStartDate ? listing.seasonStartDate.toISOString() : null
        }}
      />
    </section>
  );
}
