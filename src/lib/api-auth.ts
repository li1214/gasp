import type { NextRequest } from "next/server";

import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getApiUser(request: NextRequest | Request) {
  const token =
    "cookies" in request
      ? (request as NextRequest).cookies.get(AUTH_COOKIE)?.value
      : undefined;

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      phone: true,
      nickname: true,
      role: true,
      status: true,
      realName: true,
      idCardNo: true,
      verifiedAt: true
    }
  });
}
