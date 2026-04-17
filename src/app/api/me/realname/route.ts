import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { isAdultByIdCard } from "@/lib/id-card";
import { prisma } from "@/lib/prisma";
import { realNameVerifySchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const payload = realNameVerifySchema.parse(await request.json());

    if (!isAdultByIdCard(payload.idCardNo)) {
      return NextResponse.json({ error: "实名认证失败：身份证无效或未满18周岁" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        realName: payload.realName,
        idCardNo: payload.idCardNo,
        verifiedAt: new Date()
      },
      select: {
        id: true,
        nickname: true,
        realName: true,
        verifiedAt: true
      }
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}
