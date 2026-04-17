import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);
  if (!payload?.sub) {
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

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") {
    redirect("/auth/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/console/login");
  }
  return user;
}
