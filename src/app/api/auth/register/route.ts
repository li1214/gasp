import { NextResponse } from "next/server";

import { AUTH_COOKIE, hashPassword, shouldUseSecureAuthCookie, signAuthToken } from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());

    const captchaOk = await verifyCaptcha({
      scene: "register",
      captchaId: payload.captchaId,
      captchaCode: payload.captchaCode
    });

    if (!captchaOk) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { phone: payload.phone },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json({ error: "手机号已注册" }, { status: 409 });
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        phone: payload.phone,
        nickname: payload.nickname,
        passwordHash
      },
      select: {
        id: true,
        nickname: true,
        phone: true,
        role: true
      }
    });

    const token = await signAuthToken({ sub: user.id, role: user.role });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: shouldUseSecureAuthCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "参数错误", detail: String(error) }, { status: 400 });
  }
}
