import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/),
  nickname: z.string().min(2).max(20),
  password: z.string().min(6).max(64),
  captchaId: z.string().min(8).max(64),
  captchaCode: z.string().min(4).max(6)
});

export const loginSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/),
  password: z.string().min(6).max(64),
  captchaId: z.string().min(8).max(64),
  captchaCode: z.string().min(4).max(6)
});

const optionalCount = z.number().int().min(0).max(999999).nullable().optional();
const imageUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/uploads/") || z.string().url().safeParse(value).success, {
    message: "Invalid image url"
  });

export const listingCreateSchema = z.object({
  accountType: z.enum(["LINGXI_OFFICIAL", "CHANNEL"]),
  supportBargain: z.boolean(),
  price: z.number().min(1).max(999999),
  title: z.string().min(4).max(80),
  coverImageUrl: imageUrlSchema,
  description: z.string().max(5000).optional(),
  constructionDesc: z.string().max(3000).optional(),
  detailImageUrls: z.array(imageUrlSchema).min(1).max(20),
  seasonStartDate: z.string().optional(),
  commanderLevel: optionalCount,
  jadeCount: optionalCount,
  goldPigCount: optionalCount,
  orangeGeneralCount: optionalCount,
  collectionGeneralCount: optionalCount,
  juncaiValue: optionalCount,
  heroSkinCount: optionalCount,
  marchEffect: z.string().max(100).optional(),
  mainCityAppearance: z.string().max(100).optional(),
  orangeEquipmentCount: optionalCount,
  sTacticCount: optionalCount,
  seasonServer: z.string().min(1).max(50),
  serverName: z.string().min(1).max(50),
  hasBigTransfer: z.boolean(),
  contactInfo: z.string().min(5).max(50),
  publishNoticeAccepted: z.literal(true)
});

export const listingUpdateSchema = z.object({
  accountType: z.enum(["LINGXI_OFFICIAL", "CHANNEL"]),
  supportBargain: z.boolean(),
  price: z.number().min(1).max(999999),
  title: z.string().min(4).max(80),
  coverImageUrl: imageUrlSchema,
  description: z.string().max(5000).optional(),
  constructionDesc: z.string().max(3000).optional(),
  detailImageUrls: z.array(imageUrlSchema).min(1).max(20),
  seasonStartDate: z.string().optional(),
  commanderLevel: optionalCount,
  jadeCount: optionalCount,
  goldPigCount: optionalCount,
  orangeGeneralCount: optionalCount,
  collectionGeneralCount: optionalCount,
  juncaiValue: optionalCount,
  heroSkinCount: optionalCount,
  marchEffect: z.string().max(100).optional(),
  mainCityAppearance: z.string().max(100).optional(),
  orangeEquipmentCount: optionalCount,
  sTacticCount: optionalCount,
  seasonServer: z.string().max(50).optional(),
  serverName: z.string().max(50).optional(),
  hasBigTransfer: z.boolean(),
  contactInfo: z.string().min(5).max(50)
});

export const listingReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "OFFLINE", "SOLD"]),
  reason: z.string().max(200).optional()
});

export const siteConfigSchema = z.object({
  customerServiceUrl: z.string().url().or(z.literal("")) .optional(),
  userGroupUrl: z.string().url().or(z.literal("")) .optional(),
  publishNotice: z.string().min(30).max(6000)
});

export const profileUpdateSchema = z.object({
  nickname: z.string().min(2).max(20),
  realName: z.string().max(20).optional(),
  contactInfo: z.string().max(50).optional()
});

export const realNameVerifySchema = z.object({
  realName: z.string().min(2).max(20),
  idCardNo: z.string().regex(/^(\d{15}|\d{17}[\dXx])$/)
});

export const passwordUpdateSchema = z
  .object({
    oldPassword: z.string().min(6).max(64),
    newPassword: z.string().min(6).max(64),
    confirmPassword: z.string().min(6).max(64)
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的新密码不一致"
  });

export const userRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
});
