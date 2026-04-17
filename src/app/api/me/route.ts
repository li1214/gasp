import { NextRequest, NextResponse } from "next/server";

import { getApiUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
