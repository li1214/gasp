import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { listingUpdateSchema } from "@/lib/validators";

function isAdminActive(user: { role: string; status: string } | null) {
  return !!user && user.role === "ADMIN" && user.status === "ACTIVE";
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!isAdminActive(user)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" }
      },
      seller: {
        select: {
          id: true,
          nickname: true,
          phone: true
        }
      }
    }
  });

  if (!listing) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!isAdminActive(user)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const payload = listingUpdateSchema.parse(await request.json());

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        accountType: payload.accountType,
        supportBargain: payload.supportBargain,
        priceCents: Math.round(payload.price * 100),
        title: payload.title,
        coverImageUrl: payload.coverImageUrl,
        description: payload.description || null,
        constructionDesc: payload.constructionDesc || null,
        seasonStartDate: payload.seasonStartDate ? new Date(payload.seasonStartDate) : null,
        commanderLevel: payload.commanderLevel ?? null,
        jadeCount: payload.jadeCount ?? null,
        goldPigCount: payload.goldPigCount ?? null,
        orangeGeneralCount: payload.orangeGeneralCount ?? null,
        collectionGeneralCount: payload.collectionGeneralCount ?? null,
        juncaiValue: payload.juncaiValue ?? null,
        heroSkinCount: payload.heroSkinCount ?? null,
        marchEffect: payload.marchEffect || null,
        mainCityAppearance: payload.mainCityAppearance || null,
        orangeEquipmentCount: payload.orangeEquipmentCount ?? null,
        sTacticCount: payload.sTacticCount ?? null,
        seasonServer: payload.seasonServer || null,
        serverName: payload.serverName || null,
        hasBigTransfer: payload.hasBigTransfer,
        contactInfo: payload.contactInfo,
        images: {
          deleteMany: {},
          create: payload.detailImageUrls.map((url, index) => ({
            imageUrl: url,
            sortOrder: index
          }))
        }
      },
      select: {
        id: true,
        status: true
      }
    });

    return NextResponse.json({ listing: updated });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!isAdminActive(user)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    await prisma.listing.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "账号不存在或已删除" }, { status: 404 });
    }

    return NextResponse.json({ error: "删除失败", detail: String(error) }, { status: 500 });
  }
}
