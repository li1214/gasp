"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, ImagePlus, LoaderCircle, RefreshCw, Trash2, X } from "lucide-react";

type LocalImageItem = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_DETAIL_IMAGES = 9;

async function readResponseJson<T = any>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

function createLocalImageItem(file: File): LocalImageItem {
  const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: globalThis.crypto?.randomUUID?.() || fallbackId,
    file,
    previewUrl: URL.createObjectURL(file)
  };
}

async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/upload-images", {
    method: "POST",
    body: formData
  });

  const result = await readResponseJson<{ error?: string; urls?: string[] }>(response);
  if (!response.ok) {
    throw new Error(result?.error || `上传失败（${response.status}）`);
  }

  if (!result || !Array.isArray(result.urls)) {
    throw new Error("上传服务返回异常，请稍后重试");
  }

  return result.urls;
}

export function PublishForm() {
  const router = useRouter();
  const detailImagesRef = useRef<LocalImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noticeText, setNoticeText] = useState("账号发布须知加载中...");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [detailImages, setDetailImages] = useState<LocalImageItem[]>([]);

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => res.json())
      .then((data) => {
        setNoticeText(data.publishNotice || "账号发布须知加载失败，请稍后重试");
      })
      .catch(() => {
        setNoticeText("账号发布须知加载失败，请稍后重试");
      });
  }, []);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [coverFile]);

  useEffect(() => {
    detailImagesRef.current = detailImages;
  }, [detailImages]);

  useEffect(() => {
    return () => {
      detailImagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const detailTip = useMemo(() => {
    if (!detailImages.length) return `未选择详情图（最多 ${MAX_DETAIL_IMAGES} 张）`;
    return `已选择 ${detailImages.length}/${MAX_DETAIL_IMAGES} 张详情图`;
  }, [detailImages.length]);

  function appendDetailFiles(files: File[]) {
    if (!files.length) return;

    setError("");

    setDetailImages((prev) => {
      const remaining = MAX_DETAIL_IMAGES - prev.length;
      const nextFiles = files.slice(0, Math.max(remaining, 0));
      const nextItems = nextFiles.map((file) => createLocalImageItem(file));

      if (!remaining) {
        nextItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return prev;
      }

      if (files.length > remaining) {
        setError(`详情图最多上传 ${MAX_DETAIL_IMAGES} 张，已自动截取前 ${remaining} 张`);
      }

      return [...prev, ...nextItems];
    });
  }

  function replaceDetailFile(targetId: string, nextFile: File) {
    setError("");

    setDetailImages((prev) =>
      prev.map((item) => {
        if (item.id !== targetId) return item;
        URL.revokeObjectURL(item.previewUrl);
        return createLocalImageItem(nextFile);
      })
    );
  }

  function removeDetailFile(targetId: string) {
    setError("");

    setDetailImages((prev) => {
      const removed = prev.find((item) => item.id === targetId);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((item) => item.id !== targetId);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!coverFile) {
      setError("请先选择封面图");
      return;
    }

    if (!detailImages.length) {
      setError("请至少选择 1 张详情图");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fd = new FormData(event.currentTarget);

      const [coverUploaded, detailUploaded] = await Promise.all([
        uploadFiles([coverFile]),
        uploadFiles(detailImages.map((item) => item.file))
      ]);

      const payload = {
        accountType: String(fd.get("accountType") || ""),
        supportBargain: String(fd.get("supportBargain") || "") === "true",
        price: Number(fd.get("price") || 0),
        title: String(fd.get("title") || ""),
        coverImageUrl: coverUploaded[0],
        description: String(fd.get("description") || "").trim(),
        constructionDesc: String(fd.get("constructionDesc") || "").trim(),
        detailImageUrls: detailUploaded,
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
        contactInfo: String(fd.get("contactInfo") || "").trim(),
        publishNoticeAccepted: fd.get("publishNoticeAccepted") === "on"
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await readResponseJson<{ error?: string; listing?: { id: string } }>(response);

      if (!response.ok) {
        throw new Error(result?.error || `发布失败（${response.status}）`);
      }

      if (!result?.listing?.id) {
        throw new Error("发布成功但返回数据异常，请到“我的发布”中查看");
      }

      router.push(`/listing/${result.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="app-card p-5 space-y-4" onSubmit={onSubmit}>
        <div>
          <h1 className="text-xl font-semibold">发布账号</h1>
          <p className="text-sm text-slate-500 mt-1">请上传本地图片，系统将自动压缩后保存。</p>
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm">*账号类型</label>
            <select className="field mt-1" name="accountType" defaultValue="LINGXI_OFFICIAL" required>
              <option value="LINGXI_OFFICIAL">灵犀官服</option>
              <option value="CHANNEL">渠道服</option>
            </select>
          </div>
          <div>
            <label className="text-sm">*是否可以砍价</label>
            <select className="field mt-1" name="supportBargain" defaultValue="true" required>
              <option value="true">可以</option>
              <option value="false">不可以</option>
            </select>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm">*价格（元）</label>
            <input className="field mt-1" name="price" type="number" min={1} required />
          </div>
          <div>
            <label className="text-sm">*标题</label>
            <input className="field mt-1" name="title" required placeholder="例如：灵犀官服高俊采满配账号" />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm">*封面截图（本地上传）</label>
            <label className="upload-picker mt-1">
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
              <ImagePlus size={16} />
              <span>{coverFile ? coverFile.name : "选择封面图（jpg/png/webp）"}</span>
            </label>
            {coverPreviewUrl ? (
              <img className="mt-2 h-32 w-full rounded-xl border border-slate-200 object-cover" src={coverPreviewUrl} alt="封面预览" />
            ) : null}
          </div>

          <div>
            <label className="text-sm">*详情图数组（最多 9 张）</label>
            <div className="mt-1 space-y-2">
              <label className="upload-picker">
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    appendDetailFiles(files);
                    e.currentTarget.value = "";
                  }}
                />
                <ImagePlus size={16} />
                <span>追加详情图</span>
              </label>
              <p className="text-xs text-slate-500">{detailTip}</p>
            </div>
          </div>
        </section>

        {detailImages.length ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">已选择详情图</p>
              <button
                type="button"
                className="icon-chip"
                onClick={() => {
                  detailImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                  setDetailImages([]);
                }}
              >
                清空全部
              </button>
            </div>

            <div className="detail-picker-grid">
              {detailImages.map((item, index) => (
                <article key={item.id} className="detail-picker-card">
                  <img src={item.previewUrl} alt={`详情图${index + 1}`} className="detail-picker-image" />
                  <div className="detail-picker-meta">
                    <p className="line-clamp-1 text-xs text-slate-600">{item.file.name}</p>
                    <div className="flex items-center gap-2">
                      <label className="icon-chip cursor-pointer">
                        <RefreshCw size={14} /> 更换
                        <input
                          className="sr-only"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const nextFile = e.target.files?.[0];
                            if (nextFile) {
                              replaceDetailFile(item.id, nextFile);
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <button type="button" className="icon-chip" onClick={() => removeDetailFile(item.id)}>
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div>
          <label className="text-sm">详细描述</label>
          <textarea className="field mt-1 min-h-[110px]" name="description" placeholder="介绍账号亮点、阵容、活跃度等" />
        </div>

        <div>
          <label className="text-sm">营造描述</label>
          <textarea className="field mt-1 min-h-[90px]" name="constructionDesc" placeholder="营造、建筑、城建相关说明" />
        </div>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-sm">赛季开始日期</label>
            <input className="field mt-1" name="seasonStartDate" type="date" />
          </div>
          <div>
            <label className="text-sm">主将等级</label>
            <input className="field mt-1" name="commanderLevel" type="number" min={0} />
          </div>
          <div>
            <label className="text-sm">玉璧数量</label>
            <input className="field mt-1" name="jadeCount" type="number" min={0} />
          </div>
          <div>
            <label className="text-sm">金猪数量</label>
            <input className="field mt-1" name="goldPigCount" type="number" min={0} />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-sm">橙将数量</label>
            <input className="field mt-1" name="orangeGeneralCount" type="number" min={0} />
          </div>
          <div>
            <label className="text-sm">典藏武将数量</label>
            <input className="field mt-1" name="collectionGeneralCount" type="number" min={0} />
          </div>
          <div>
            <label className="text-sm">俊采值</label>
            <input className="field mt-1" name="juncaiValue" type="number" min={0} />
          </div>
          <div>
            <label className="text-sm">武将皮肤数</label>
            <input className="field mt-1" name="heroSkinCount" type="number" min={0} />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div>
            <label className="text-sm">行军特效</label>
            <input className="field mt-1" name="marchEffect" />
          </div>
          <div>
            <label className="text-sm">主城外观</label>
            <input className="field mt-1" name="mainCityAppearance" />
          </div>
          <div>
            <label className="text-sm">橙装数量</label>
            <input className="field mt-1" name="orangeEquipmentCount" type="number" min={0} />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-sm">S战法数量</label>
            <input className="field mt-1" name="sTacticCount" type="number" min={0} />
          </div>
          <div>
            <label className="text-sm">*赛季服</label>
            <input className="field mt-1" name="seasonServer" placeholder="例如：S15" required />
          </div>
          <div>
            <label className="text-sm">*服务器名</label>
            <input className="field mt-1" name="serverName" placeholder="例如：龙争虎斗" required />
          </div>
          <div>
            <label className="text-sm">*是否有大跨</label>
            <select className="field mt-1" name="hasBigTransfer" defaultValue="false" required>
              <option value="true">有大跨</option>
              <option value="false">无大跨</option>
            </select>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm">*联系方式</label>
            <input className="field mt-1" name="contactInfo" required placeholder="微信/QQ/电话" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="icon-chip"
            onClick={() => setNoticeOpen(true)}
          >
            <BookOpenCheck size={16} /> 阅读账号发布须知
          </button>

          <label className="flex items-center gap-2 text-sm mt-3">
            <input name="publishNoticeAccepted" type="checkbox" required />
            我已阅读并同意《账号发布须知》
          </label>
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button className="btn w-full inline-flex items-center justify-center gap-2" type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> 发布中...
            </>
          ) : (
            "发布"
          )}
        </button>
      </form>

      {noticeOpen ? (
        <div className="modal-mask" role="dialog" aria-modal="true" aria-label="账号发布须知">
          <section className="modal-card">
            <header className="modal-header">
              <h3 className="font-semibold">账号发布须知</h3>
              <button type="button" className="icon-chip" onClick={() => setNoticeOpen(false)}>
                <X size={14} /> 关闭
              </button>
            </header>
            <div className="modal-body whitespace-pre-wrap text-sm leading-6">{noticeText}</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
