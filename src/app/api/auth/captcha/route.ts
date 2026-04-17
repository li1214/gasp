import { NextRequest, NextResponse } from "next/server";

import { createCaptcha } from "@/lib/captcha";

export async function GET(request: NextRequest) {
  const scene = request.nextUrl.searchParams.get("scene") || "login";
  const { id, svg } = await createCaptcha(scene);
  return NextResponse.json({ captchaId: id, svg });
}