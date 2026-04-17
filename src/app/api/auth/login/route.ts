import { NextResponse } from "next/server";

import { AUTH_COOKIE, shouldUseSecureAuthCookie, signAuthToken, verifyPassword } from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    const captchaOk = await verifyCaptcha({
      scene: "login",
      captchaId: payload.captchaId,
      captchaCode: payload.captchaCode
    });

    if (!captchaOk) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone: payload.phone },
      select: {
        id: true,
        phone: true,
        nickname: true,
        passwordHash: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "账号已被禁用" }, { status: 403 });
    }

    const valid = await verifyPassword(payload.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    const token = await signAuthToken({ sub: user.id, role: user.role });
    const response = NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        role: user.role
      }
    });

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
