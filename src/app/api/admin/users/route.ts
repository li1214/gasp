import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      phone: true,
      verifiedAt: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          listings: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return NextResponse.json({ users });
}
