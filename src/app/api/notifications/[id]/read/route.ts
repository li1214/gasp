import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      isRead: true
    }
  });

  if (!notification) {
    return NextResponse.json({ error: "消息不存在" }, { status: 404 });
  }

  if (notification.userId !== user.id) {
    return NextResponse.json({ error: "无权操作该消息" }, { status: 403 });
  }

  if (notification.isRead) {
    return NextResponse.json({ ok: true });
  }

  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  return NextResponse.json({ ok: true });
}
