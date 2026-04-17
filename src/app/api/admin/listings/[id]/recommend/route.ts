import { ListingStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  let payload: { recommended?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  if (typeof payload.recommended !== "boolean") {
    return NextResponse.json({ error: "推荐状态参数错误" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      isRecommended: true
    }
  });

  if (!listing) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }

  if (payload.recommended && listing.status !== ListingStatus.APPROVED) {
    return NextResponse.json({ error: "仅已上架账号可设为推荐" }, { status: 400 });
  }

  if (payload.recommended && !listing.isRecommended) {
    const recommendedCount = await prisma.listing.count({
      where: {
        status: ListingStatus.APPROVED,
        isRecommended: true
      }
    });

    if (recommendedCount >= 10) {
      return NextResponse.json({ error: "推荐账号最多10个，请先取消其他推荐" }, { status: 400 });
    }
  }

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: {
      isRecommended: payload.recommended
    },
    select: {
      id: true,
      isRecommended: true
    }
  });

  return NextResponse.json({ listing: updated });
}
