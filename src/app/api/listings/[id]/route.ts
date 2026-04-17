import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const sellerActionSchema = z.object({
  action: z.enum(["OFFLINE", "SOLD", "RESUBMIT"])
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" }
      },
      seller: {
        select: {
          id: true,
          nickname: true
        }
      },
      audits: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          admin: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      },
      favorites: user
        ? {
            where: {
              userId: user.id
            },
            take: 1
          }
        : false
    }
  });

  if (!listing) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }

  const canViewNonApproved =
    !!user && (user.role === "ADMIN" || user.id === listing.sellerId);

  if (listing.status !== "APPROVED" && !canViewNonApproved) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }

  if (listing.status === "APPROVED") {
    prisma.listing
      .update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } }
      })
      .catch(() => null);
  }

  return NextResponse.json({
    listing,
    isFavorite: !!(Array.isArray(listing.favorites) && listing.favorites.length)
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const payload = sellerActionSchema.parse(await request.json());

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        sellerId: true
      }
    });

    if (!listing) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }

    if (listing.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限操作" }, { status: 403 });
    }

    let nextStatus: "OFFLINE" | "SOLD" | "PENDING" = "PENDING";
    let reason = "";

    if (payload.action === "OFFLINE") {
      nextStatus = "OFFLINE";
      reason = "卖家主动下架";
    }

    if (payload.action === "SOLD") {
      nextStatus = "SOLD";
      reason = "卖家标记已售";
    }

    if (payload.action === "RESUBMIT") {
      nextStatus = "PENDING";
      reason = "卖家重新提交审核";
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        rejectReason: null,
        audits: {
          create: {
            action:
              payload.action === "SOLD"
                ? "MARK_SOLD"
                : payload.action === "OFFLINE"
                  ? "OFFLINE"
                  : "SUBMIT",
            adminId: user.role === "ADMIN" ? user.id : null,
            reason
          }
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