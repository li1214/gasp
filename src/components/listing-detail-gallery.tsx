"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  imageUrls: string[];
};

export function ListingDetailGallery({ title, imageUrls }: Props) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <section>
        <p className="font-semibold text-sm">账号详情图</p>
        <div className="detail-image-list mt-2">
          {imageUrls.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              className="detail-image-btn"
              onClick={() => setActive(url)}
              aria-label={`预览详情图 ${idx + 1}`}
            >
              <img className="detail-image" src={url} alt={`${title}-详情图-${idx + 1}`} />
            </button>
          ))}
        </div>
      </section>

      {active ? (
        <div className="image-preview-mask" role="dialog" aria-modal="true" aria-label="图片预览">
          <button type="button" className="image-preview-close" onClick={() => setActive(null)}>
            <X size={16} /> 关闭
          </button>
          <img className="image-preview-main" src={active} alt={`${title}-全屏预览`} />
        </div>
      ) : null}
    </>
  );
}
