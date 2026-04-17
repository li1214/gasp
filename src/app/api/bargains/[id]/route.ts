import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = new Set(["ACCEPTED", "REJECTED"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const nextStatus =
    typeof payload?.status === "string" ? payload.status.toUpperCase() : "";

  if (!ALLOWED_STATUS.has(nextStatus)) {
    return NextResponse.json({ error: "不支持的操作类型" }, { status: 400 });
  }

  const bargain = await prisma.bargain.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      listingId: true,
      status: true,
      listing: {
        select: {
          sellerId: true,
          title: true
        }
      }
    }
  });

  if (!bargain) {
    return NextResponse.json({ error: "砍价记录不存在" }, { status: 404 });
  }

  if (bargain.listing.sellerId !== user.id) {
    return NextResponse.json({ error: "无权操作该砍价记录" }, { status: 403 });
  }

  if (bargain.status !== "PENDING") {
    return NextResponse.json({ error: "该砍价已处理，不能重复操作" }, { status: 409 });
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const updatedBargain = await tx.bargain.update({
      where: { id: params.id },
      data: {
        status: nextStatus as "ACCEPTED" | "REJECTED",
        handledAt: now
      },
      select: {
        id: true,
        status: true,
        handledAt: true
      }
    });

    const accepted = nextStatus === "ACCEPTED";
    await tx.notification.create({
      data: {
        userId: bargain.userId,
        type: accepted ? "BARGAIN_ACCEPTED" : "BARGAIN_REJECTED",
        title: accepted ? "你的砍价已被同意" : "你的砍价已被拒绝",
        content: accepted
          ? `你对「${bargain.listing.title}」的砍价申请已被卖家同意，请尽快联系卖家完成交易。`
          : `你对「${bargain.listing.title}」的砍价申请已被卖家拒绝。`,
        bargainId: bargain.id,
        listingId: bargain.listingId
      }
    });

    return updatedBargain;
  });

  return NextResponse.json({
    ok: true,
    bargain: updated
  });
}
