import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { getApiUser } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function isUploadLike(value: FormDataEntryValue): value is File {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as Partial<File>;
  return (
    typeof maybe.arrayBuffer === "function" &&
    typeof maybe.type === "string" &&
    typeof maybe.size === "number"
  );
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter(isUploadLike);

    if (!files.length) {
      return NextResponse.json({ error: "未选择图片" }, { status: 400 });
    }

    if (files.length > 20) {
      return NextResponse.json({ error: "单次最多上传 20 张" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json({ error: `不支持的格式: ${file.type}` }, { status: 400 });
      }

      if (file.size > 12 * 1024 * 1024) {
        return NextResponse.json({ error: "单张图片不能超过 12MB" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const optimized = await sharp(buffer)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();

      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
      const abs = path.join(dir, filename);

      await writeFile(abs, optimized);
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("[upload-images] unexpected error", error);
    return NextResponse.json({ error: "图片上传失败，请稍后重试" }, { status: 500 });
  }
}
