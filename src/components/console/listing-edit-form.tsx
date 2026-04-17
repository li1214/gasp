"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";

type ListingData = {
  id: string;
  title: string;
  accountType: "LINGXI_OFFICIAL" | "CHANNEL";
  supportBargain: boolean;
  priceCents: number;
  coverImageUrl: string;
  description: string | null;
  constructionDesc: string | null;
  seasonStartDate: string | null;
  commanderLevel: number | null;
  jadeCount: number | null;
  goldPigCount: number | null;
  orangeGeneralCount: number | null;
  collectionGeneralCount: number | null;
  juncaiValue: number | null;
  heroSkinCount: number | null;
  marchEffect: string | null;
  mainCityAppearance: string | null;
  orangeEquipmentCount: number | null;
  sTacticCount: number | null;
  seasonServer: string | null;
  serverName: string | null;
  hasBigTransfer: boolean;
  contactInfo: string;
  images: { imageUrl: string }[];
};

const MAX_DETAIL_IMAGES = 9;

function toNullableNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/upload-images", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "图片上传失败");
  }

  return result.urls as string[];
}

export function ConsoleListingEditForm({ listing }: { listing: ListingData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverImageUrl] = useState(listing.coverImageUrl);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>(listing.images.map((item) => item.imageUrl));
  const [detailFiles, setDetailFiles] = useState<File[]>([]);

  const dateValue = useMemo(() => {
    if (!listing.seasonStartDate) return "";
    return listing.seasonStartDate.slice(0, 10);
  }, [listing.seasonStartDate]);

  const detailTip = useMemo(() => {
    if (detailFiles.length) return `将替换为 ${detailFiles.length}/${MAX_DETAIL_IMAGES} 张本地图片`;
    if (detailImageUrls.length) return `当前详情图：${detailImageUrls.length} 张`;
    return "未选择详情图";
  }, [detailFiles.length, detailImageUrls.length]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    setLoading(true);
    setError("");

    try {
      let nextCoverImageUrl = coverImageUrl;
      let nextDetailImageUrls = detailImageUrls;

      if (coverFile) {
        const uploaded = await uploadFiles([coverFile]);
        nextCoverImageUrl = uploaded[0];
      }

      if (detailFiles.length) {
        nextDetailImageUrls = await uploadFiles(detailFiles);
      }

      if (!nextCoverImageUrl) {
        throw new Error("请先上传封面图");
      }

      if (!nextDetailImageUrls.length) {
        throw new Error("请至少保留 1 张详情图");
      }

      const payload = {
        accountType: String(fd.get("accountType") || ""),
        supportBargain: String(fd.get("supportBargain") || "") === "true",
        price: Number(fd.get("price") || 0),
        title: String(fd.get("title") || ""),
        coverImageUrl: nextCoverImageUrl,
        description: String(fd.get("description") || "").trim(),
        constructionDesc: String(fd.get("constructionDesc") || "").trim(),
        detailImageUrls: nextDetailImageUrls,
        seasonStartDate: String(fd.get("seasonStartDate") || "").trim(),
        commanderLevel: toNullableNumber(fd.get("commanderLevel")),
        jadeCount: toNullableNumber(fd.get("jadeCount")),
        goldPigCount: toNullableNumber(fd.get("goldPigCount")),
        orangeGeneralCount: toNullableNumber(fd.get("orangeGeneralCount")),
        collectionGeneralCount: toNullableNumber(fd.get("collectionGeneralCount")),
        juncaiValue: toNullableNumber(fd.get("juncaiValue")),
        heroSkinCount: toNullableNumber(fd.get("heroSkinCount")),
        marchEffect: String(fd.get("marchEffect") || "").trim(),
        mainCityAppearance: String(fd.get("mainCityAppearance") || "").trim(),
        orangeEquipmentCount: toNullableNumber(fd.get("orangeEquipmentCount")),
        sTacticCount: toNullableNumber(fd.get("sTacticCount")),
        seasonServer: String(fd.get("seasonServer") || "").trim(),
        serverName: String(fd.get("serverName") || "").trim(),
        hasBigTransfer: String(fd.get("hasBigTransfer") || "") === "true",
        contactInfo: String(fd.get("contactInfo") || "").trim()
      };

      const response = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      router.push("/console/listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }

    setLoading(false);
  }

  return (
    <form className="console-panel p-4 space-y-3" onSubmit={onSubmit}>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">账号类型</label>
          <select className="field mt-1" name="accountType" defaultValue={listing.accountType}>
            <option value="LINGXI_OFFICIAL">灵犀官服</option>
            <option value="CHANNEL">渠道服</option>
          </select>
        </div>
        <div>
          <label className="text-sm">是否可砍价</label>
          <select className="field mt-1" name="supportBargain" defaultValue={listing.supportBargain ? "true" : "false"}>
            <option value="true">可砍价</option>
            <option value="false">不议价</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">价格（元）</label>
          <input className="field mt-1" name="price" type="number" min={1} defaultValue={Math.round(listing.priceCents / 100)} />
        </div>
        <div>
          <label className="text-sm">标题</label>
          <input className="field mt-1" name="title" defaultValue={listing.title} />
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">封面图（本地上传+压缩）</label>
          <label className="upload-picker mt-1">
            <ImagePlus size={16} />
            <span className="text-slate-600">{coverFile ? coverFile.name : "选择本地封面图"}</span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </label>
          <p className="text-xs text-slate-500 mt-1">{coverFile ? "保存后替换封面图" : "保持当前封面图"}</p>
          <img className="mt-2 h-28 w-full max-w-xs rounded-xl object-cover border border-slate-200" src={coverImageUrl} alt={listing.title} />
        </div>

        <div>
          <label className="text-sm">详情图（本地上传+压缩）</label>
          <label className="upload-picker mt-1">
            <ImagePlus size={16} />
            <span className="text-slate-600">{detailFiles.length ? `已选 ${detailFiles.length} 张` : "选择本地详情图（最多9张）"}</span>
            <input
              className="sr-only"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                if (selected.length > MAX_DETAIL_IMAGES) {
                  setError(`详情图最多替换 ${MAX_DETAIL_IMAGES} 张，已自动截取前 ${MAX_DETAIL_IMAGES} 张`);
                  setDetailFiles(selected.slice(0, MAX_DETAIL_IMAGES));
                } else {
                  setError("");
                  setDetailFiles(selected);
                }
                e.currentTarget.value = "";
              }}
            />
          </label>
          <p className="text-xs text-slate-500 mt-1">{detailTip}</p>
          {detailFiles.length ? (
            <button
              type="button"
              className="icon-chip mt-2"
              onClick={() => setDetailFiles([])}
            >
              取消替换
            </button>
          ) : null}
        </div>
      </section>

      {!detailFiles.length ? (
        <section className="space-y-2">
          <label className="text-sm">当前详情图</label>
          {detailImageUrls.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {detailImageUrls.map((url, index) => (
                <div className="relative" key={`${url}-${index}`}>
                  <img className="h-24 w-full rounded-xl object-cover border border-slate-200" src={url} alt={`detail-${index + 1}`} />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white"
                    onClick={() => setDetailImageUrls((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-700">暂无详情图，请上传本地详情图后保存。</p>
          )}
        </section>
      ) : (
        <section className="space-y-2">
          <label className="text-sm">待替换文件</label>
          <div className="rounded-xl border border-slate-200 p-2 text-xs text-slate-600 max-h-36 overflow-y-auto grid gap-1">
            {detailFiles.map((file, index) => (
              <p key={`${file.name}-${index}`} className="line-clamp-1">
                {index + 1}. {file.name}
              </p>
            ))}
          </div>
        </section>
      )}

      <div>
        <label className="text-sm">详细描述</label>
        <textarea className="field mt-1 min-h-[120px]" name="description" defaultValue={listing.description || ""} />
      </div>

      <div>
        <label className="text-sm">营造描述</label>
        <textarea className="field mt-1 min-h-[80px]" name="constructionDesc" defaultValue={listing.constructionDesc || ""} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input className="field" name="seasonStartDate" type="date" defaultValue={dateValue} />
        <input className="field" name="commanderLevel" type="number" min={0} defaultValue={listing.commanderLevel ?? undefined} placeholder="主将等级" />
        <input className="field" name="jadeCount" type="number" min={0} defaultValue={listing.jadeCount ?? undefined} placeholder="玉璧" />
        <input className="field" name="goldPigCount" type="number" min={0} defaultValue={listing.goldPigCount ?? undefined} placeholder="金猪" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input className="field" name="orangeGeneralCount" type="number" min={0} defaultValue={listing.orangeGeneralCount ?? undefined} placeholder="橙将数量" />
        <input className="field" name="collectionGeneralCount" type="number" min={0} defaultValue={listing.collectionGeneralCount ?? undefined} placeholder="典藏武将" />
        <input className="field" name="juncaiValue" type="number" min={0} defaultValue={listing.juncaiValue ?? undefined} placeholder="俊采值" />
        <input className="field" name="heroSkinCount" type="number" min={0} defaultValue={listing.heroSkinCount ?? undefined} placeholder="武将皮肤数" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <input className="field" name="marchEffect" defaultValue={listing.marchEffect || ""} placeholder="行军特效" />
        <input className="field" name="mainCityAppearance" defaultValue={listing.mainCityAppearance || ""} placeholder="主城外观" />
        <input className="field" name="orangeEquipmentCount" type="number" min={0} defaultValue={listing.orangeEquipmentCount ?? undefined} placeholder="橙装数量" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input className="field" name="sTacticCount" type="number" min={0} defaultValue={listing.sTacticCount ?? undefined} placeholder="S战法数量" />
        <input className="field" name="seasonServer" defaultValue={listing.seasonServer || ""} placeholder="赛季服" />
        <input className="field" name="serverName" defaultValue={listing.serverName || ""} placeholder="服务器名" />
        <select className="field" name="hasBigTransfer" defaultValue={listing.hasBigTransfer ? "true" : "false"}>
          <option value="true">有大跨</option>
          <option value="false">无大跨</option>
        </select>
      </div>

      <div>
        <label className="text-sm">联系方式</label>
        <input className="field mt-1" name="contactInfo" defaultValue={listing.contactInfo} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "保存中..." : "保存账号信息"}
      </button>
    </form>
  );
}
