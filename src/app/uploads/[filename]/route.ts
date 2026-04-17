import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadRoot = path.join(process.cwd(), "public", "uploads");

const mimeMap: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif"
};

function toSafeFilename(raw: string) {
  const decoded = decodeURIComponent(raw || "").trim();

  if (!decoded || decoded.includes("..") || decoded.includes("/") || decoded.includes("\\")) {
    return null;
  }

  if (!/^[A-Za-z0-9._-]+$/.test(decoded)) {
    return null;
  }

  return decoded;
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const filename = toSafeFilename(params.filename);
  if (!filename) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const absPath = path.join(uploadRoot, filename);
  if (!absPath.startsWith(uploadRoot + path.sep)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const data = await readFile(absPath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return new NextResponse("Not Found", { status: 404 });
    }

    console.error("[uploads.dynamic] read file failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
