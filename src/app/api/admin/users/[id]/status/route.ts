import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["ACTIVE", "BANNED"])
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const payload = schema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status: payload.status },
      select: {
        id: true,
        status: true
      }
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}
