"use client";

import { Heart, MessageCircleQuestion, MessageSquareShare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: string;
  supportBargain: boolean;
  isLoggedIn: boolean;
  defaultFavorited: boolean;
  defaultFavoriteCount: number;
  customerServiceUrl?: string;
  userGroupUrl?: string;
};

type FavoriteResult = {
  favorited: boolean;
  favoriteCount: number;
  error?: string;
};

type BargainResult = {
  message?: string;
  error?: string;
};

async function readResponseJson<T = any>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function ListingActionBar({
  listingId,
  supportBargain,
  isLoggedIn,
  defaultFavorited,
  defaultFavoriteCount,
  customerServiceUrl,
  userGroupUrl
}: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(defaultFavorited);
  const [favoriteCount, setFavoriteCount] = useState(defaultFavoriteCount);
  const [loading, setLoading] = useState("");

  async function handleFavorite() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    setLoading("favorite");
    const response = await fetch(`/api/listings/${listingId}/favorite`, {
      method: "POST"
    });
    const result = await readResponseJson<FavoriteResult>(response);
    setLoading("");

    if (response.ok && result) {
      setFavorited(!!result.favorited);
      setFavoriteCount(Number(result.favoriteCount) || 0);
      return;
    }

    window.alert(result?.error || `收藏失败（${response.status}）`);
  }

  async function handleBargain() {
    if (!supportBargain) {
      window.alert("该账号不支持砍价");
      return;
    }

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    const message = window.prompt("可填写砍价留言（可选）", "有诚意购买，希望优惠一点");
    setLoading("bargain");

    const response = await fetch(`/api/listings/${listingId}/bargain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message || "" })
    });
    const result = await readResponseJson<BargainResult>(response);
    setLoading("");

    if (response.ok) {
      window.alert(result?.message || "砍价申请已提交");
      return;
    }

    window.alert(result?.error || `提交失败（${response.status}）`);
  }

  function openLink(url?: string, label?: string) {
    if (!url) {
      window.alert(`${label || "链接"}暂未配置，请联系管理员`);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="detail-action-panel app-card" aria-label="账号互动操作">
      <div className="detail-action-head">
        <p className="detail-action-title">互动操作</p>
        <p className="detail-action-sub">收藏、砍价、客服与社群入口</p>
      </div>

      <div className="detail-action-grid">
        <button
          type="button"
          className={`detail-action-btn ${favorited ? "is-active" : ""}`}
          onClick={handleFavorite}
          disabled={loading === "favorite"}
        >
          <Heart size={16} fill={favorited ? "currentColor" : "none"} />
          {loading === "favorite" ? "处理中" : `收藏 ${favoriteCount}`}
        </button>

        <button
          type="button"
          className="detail-action-btn"
          onClick={handleBargain}
          disabled={loading === "bargain"}
        >
          <MessageCircleQuestion size={16} />
          {loading === "bargain" ? "提交中" : "我要砍价"}
        </button>

        <button
          type="button"
          className="detail-action-btn"
          onClick={() => openLink(customerServiceUrl, "客服链接")}
        >
          <MessageSquareShare size={16} />
          咨询客服
        </button>

        <button
          type="button"
          className="detail-action-btn"
          onClick={() => openLink(userGroupUrl, "用户交流群")}
        >
          <Users size={16} />
          用户群
        </button>
      </div>
    </section>
  );
}
