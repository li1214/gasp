import { NextRequest, NextResponse } from "next/server";

import { hashPassword, verifyPassword } from "@/lib/auth";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { passwordUpdateSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const payload = passwordUpdateSchema.parse(await request.json());

    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true }
    });

    if (!current) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }

    const ok = await verifyPassword(payload.oldPassword, current.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "旧密码错误" }, { status: 400 });
    }

    const newHash = await hashPassword(payload.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}