import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const payload = profileUpdateSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: payload.nickname,
        realName: payload.realName || null
      },
      select: {
        id: true,
        nickname: true,
        realName: true,
        phone: true
      }
    });

    const listings = await prisma.listing.findMany({
      where: { sellerId: user.id },
      select: { id: true },
      take: 1000
    });

    if (payload.contactInfo) {
      await prisma.listing.updateMany({
        where: {
          id: { in: listings.map((l) => l.id) }
        },
        data: {
          contactInfo: payload.contactInfo
        }
      });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}