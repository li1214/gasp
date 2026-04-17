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

  await prisma.bargain.create({
    data: {
      userId: user.id,
      listingId: params.id,
      message: typeof payload.message === "string" ? payload.message.slice(0, 120) : null
    }
  });

  return NextResponse.json({ ok: true, message: "砍价申请已提交，卖家将尽快联系你" });
}