import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { listingReviewSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const payload = listingReviewSchema.parse(await request.json());

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true
      }
    });

    if (!listing) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }

    const statusMap = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      OFFLINE: "OFFLINE",
      SOLD: "SOLD"
    } as const;

    const actionMap = {
      APPROVE: "APPROVE",
      REJECT: "REJECT",
      OFFLINE: "OFFLINE",
      SOLD: "MARK_SOLD"
    } as const;

    const nextStatus = statusMap[payload.action];
    const auditAction = actionMap[payload.action];

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        isRecommended: payload.action === "APPROVE" ? undefined : false,
        rejectReason: payload.action === "REJECT" ? payload.reason || "资料不完整" : null,
        publishedAt: payload.action === "APPROVE" ? new Date() : undefined,
        audits: {
          create: {
            action: auditAction,
            adminId: user.id,
            reason: payload.reason || null
          }
        }
      },
      select: {
        id: true,
        status: true,
        rejectReason: true,
        publishedAt: true
      }
    });

    return NextResponse.json({ listing: updated });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}
