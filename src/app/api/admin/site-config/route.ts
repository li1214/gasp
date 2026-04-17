import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";
import { DEFAULT_PUBLISH_NOTICE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { siteConfigSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });

  return NextResponse.json({
    customerServiceUrl: config?.customerServiceUrl || "",
    userGroupUrl: config?.userGroupUrl || "",
    publishNotice: config?.publishNotice || DEFAULT_PUBLISH_NOTICE
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const payload = siteConfigSchema.parse(await request.json());

    const updated = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {
        customerServiceUrl: payload.customerServiceUrl || null,
        userGroupUrl: payload.userGroupUrl || null,
        publishNotice: payload.publishNotice
      },
      create: {
        id: 1,
        customerServiceUrl: payload.customerServiceUrl || null,
        userGroupUrl: payload.userGroupUrl || null,
        publishNotice: payload.publishNotice
      }
    });

    return NextResponse.json({
      customerServiceUrl: updated.customerServiceUrl || "",
      userGroupUrl: updated.userGroupUrl || "",
      publishNotice: updated.publishNotice || DEFAULT_PUBLISH_NOTICE
    });
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}
