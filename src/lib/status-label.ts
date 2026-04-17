const LISTING_STATUS_MAP: Record<string, string> = {
  DRAFT: "草稿",
  PENDING: "待审核",
  APPROVED: "已上架",
  REJECTED: "已驳回",
  OFFLINE: "已下架",
  SOLD: "已售出"
};

const BARGAIN_STATUS_MAP: Record<string, string> = {
  PENDING: "待处理",
  ACCEPTED: "已同意",
  REJECTED: "已拒绝"
};

const USER_STATUS_MAP: Record<string, string> = {
  ACTIVE: "正常",
  BANNED: "封禁"
};

export function listingStatusLabel(status: string | null | undefined) {
  if (!status) return "状态未知";
  return LISTING_STATUS_MAP[status] || "状态未知";
}

export function bargainStatusLabel(status: string | null | undefined) {
  if (!status) return "状态未知";
  return BARGAIN_STATUS_MAP[status] || "状态未知";
}

export function userStatusLabel(status: string | null | undefined) {
  if (!status) return "状态未知";
  return USER_STATUS_MAP[status] || "状态未知";
}
