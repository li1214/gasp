import { ListingAccountType, ListingStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

function asText(value: string | null) {
  return (value || "").trim();
}

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusRaw = asText(searchParams.get("status"));
  const accountTypeRaw = asText(searchParams.get("accountType"));
  const recommendedRaw = asText(searchParams.get("recommended"));
  const keyword = asText(searchParams.get("q"));

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

  const listings = await prisma.listing.findMany({
    where,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1
      },
      seller: {
        select: {
          id: true,
          nickname: true,
          phone: true
        }
      }
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 300
  });

  return NextResponse.json({ listings });
}
