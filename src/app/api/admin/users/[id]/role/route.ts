import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { userRoleSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const payload = userRoleSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: payload.role },
      select: {
        id: true,
        role: true
      }
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}