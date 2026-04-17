import { NextResponse } from "next/server";

import { DEFAULT_PUBLISH_NOTICE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });

  if (!config) {
    return NextResponse.json({
      customerServiceUrl: "",
      userGroupUrl: "",
      publishNotice: DEFAULT_PUBLISH_NOTICE
    });
  }

  return NextResponse.json({
    customerServiceUrl: config.customerServiceUrl || "",
    userGroupUrl: config.userGroupUrl || "",
    publishNotice: config.publishNotice || DEFAULT_PUBLISH_NOTICE
  });
}
