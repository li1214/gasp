import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { getApiUser } from "@/lib/api-auth";
import { isAdultByIdCard } from "@/lib/id-card";
import { prisma } from "@/lib/prisma";
import { listingCreateSchema } from "@/lib/validators";

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const minPrice = parseNumber(searchParams.get("minPrice"));
  const maxPrice = parseNumber(searchParams.get("maxPrice"));
  const accountType = searchParams.get("accountType");
  const supportBargain = parseBoolean(searchParams.get("supportBargain"));
  const hasBigTransfer = parseBoolean(searchParams.get("hasBigTransfer"));
  const keyword = searchParams.get("keyword") || undefined;
  const serverName = searchParams.get("serverName") || undefined;

  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
    accountType:
      accountType === "LINGXI_OFFICIAL" || accountType === "CHANNEL"
        ? accountType
        : undefined,
    supportBargain,
    hasBigTransfer,
    title: keyword
      ? {
          contains: keyword
        }
      : undefined,
    serverName: serverName
      ? {
          contains: serverName
        }
      : undefined,
    priceCents: {
      gte: minPrice ? minPrice * 100 : undefined,
      lte: maxPrice ? maxPrice * 100 : undefined
    }
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
          nickname: true
        }
      }
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100
  });

  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const payload = listingCreateSchema.parse(await request.json());

    if (!user.realName || !user.idCardNo || !user.verifiedAt) {
      return NextResponse.json({ error: "请先完成实名认证后再发布账号" }, { status: 403 });
    }

    if (!isAdultByIdCard(user.idCardNo)) {
      return NextResponse.json({ error: "实名认证未通过或未满18周岁，禁止发布" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
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
        status: "PENDING",
        audits: {
          create: {
            action: "SUBMIT",
            reason: "卖家提交上架"
          }
        },
        images: {
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

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "参数错误", detail: error.issues }, { status: 400 });
    }

    console.error("[listings.create] unexpected error", error);
    return NextResponse.json({ error: "发布失败，服务器异常，请稍后重试" }, { status: 500 });
  }
}
