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
      id: true
    }
  });

  if (!listing) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId: user.id,
        listingId: params.id
      }
    }
  });

  let favorited = false;

  if (existing) {
    await prisma.$transaction([
      prisma.favorite.delete({ where: { id: existing.id } }),
      prisma.listing.update({
        where: { id: params.id },
        data: {
          favoriteCount: {
            decrement: 1
          }
        }
      })
    ]);
    favorited = false;
  } else {
    await prisma.$transaction([
      prisma.favorite.create({
        data: {
          userId: user.id,
          listingId: params.id
        }
      }),
      prisma.listing.update({
        where: { id: params.id },
        data: {
          favoriteCount: {
            increment: 1
          }
        }
      })
    ]);
    favorited = true;
  }

  const refreshed = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { favoriteCount: true }
  });

  return NextResponse.json({
    favorited,
    favoriteCount: refreshed?.favoriteCount || 0
  });
}