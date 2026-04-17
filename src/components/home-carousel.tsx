"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CarouselItem = {
  id: string;
  title: string;
  priceText: string;
  imageUrl: string;
  accountTypeLabel: string;
  hasBigTransfer: boolean;
};

export function HomeCarousel({ items }: { items: CarouselItem[] }) {
  const slides = useMemo(
    () =>
      items.length
        ? items
        : [
            {
              id: "default",
              title: "高配账号推荐位",
              priceText: "联系客服",
              imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200",
              accountTypeLabel: "灵犀官服",
              hasBigTransfer: true
            }
          ],
    [items]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3600);

    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="carousel app-card">
      <div
        className="carousel-slide"
        style={{
          backgroundImage: `url(${current.imageUrl})`
        }}
      >
        <div className="carousel-mask" />
        <div className="carousel-content space-y-2">
          <p className="text-xs opacity-90">推荐账号</p>
          <h2 className="text-lg font-bold leading-7 line-clamp-2">{current.title}</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-white/90">{current.accountTypeLabel}</span>
            <span className="badge bg-white/90">{current.hasBigTransfer ? "有大跨" : "无大跨"}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xl font-bold">¥{current.priceText}</p>
            {current.id === "default" ? (
              <Link href="/market" className="btn btn-outline text-xs !text-slate-800 !bg-white/95">
                去检索页
              </Link>
            ) : (
              <Link href={`/listing/${current.id}`} className="btn btn-outline text-xs !text-slate-800 !bg-white/95">
                立即查看
              </Link>
            )}
          </div>
          <div className="dot-row pt-1">
            {slides.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                className={`dot ${dotIndex === index ? "active" : ""}`}
                onClick={() => setIndex(dotIndex)}
                aria-label={`切换到第${dotIndex + 1}张`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
