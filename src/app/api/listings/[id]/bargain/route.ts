import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      priceCents: true,
      supportBargain: true,
      sellerId: true
    }
  });

  if (!listing) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }

  if (!listing.supportBargain) {
    return NextResponse.json({ error: "该账号不支持砍价" }, { status: 400 });
  }

  if (listing.sellerId === user.id) {
    return NextResponse.json({ error: "不能对自己的账号砍价" }, { status: 400 });
  }

  const payload = await request.json().catch(() => ({}));

  const rawOfferPrice =
    typeof payload.offerPrice === "string" || typeof payload.offerPrice === "number"
      ? Number(payload.offerPrice)
      : NaN;
  if (!Number.isFinite(rawOfferPrice) || rawOfferPrice <= 0) {
    return NextResponse.json({ error: "请输入有效的砍价金额" }, { status: 400 });
  }

  const offerPriceCents = Math.round(rawOfferPrice * 100);
  if (offerPriceCents <= 0) {
    return NextResponse.json({ error: "请输入有效的砍价金额" }, { status: 400 });
  }
  if (offerPriceCents >= listing.priceCents) {
    return NextResponse.json({ error: "砍价金额需低于当前标价" }, { status: 400 });
  }

  const pending = await prisma.bargain.findFirst({
    where: {
      userId: user.id,
      listingId: params.id,
      status: "PENDING"
    },
    select: { id: true }
  });

  if (pending) {
    return NextResponse.json({ error: "你已提交过砍价申请，请等待卖家处理" }, { status: 409 });
  }

  await prisma.bargain.create({
    data: {
      userId: user.id,
      listingId: params.id,
      offerPriceCents
    }
  });

  return NextResponse.json({ ok: true, message: "砍价申请已提交，卖家将尽快联系你" });
}
