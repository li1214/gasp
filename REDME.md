# SGZZ 平台技术说明（REDME）

## 一、系统定位

本项目由两套前端系统组成：

1. 展示端（移动端优先）
- 用于账号展示、检索、详情浏览、个人资料维护、发布账号。
- 不提供交易托管能力，仅做账号信息展示。

2. 后台端（独立 Console）
- 路由：`/console`
- 独立 UI 与导航，不复用展示端头部/底部菜单。
- 用于统计、用户与权限管理、发布账号审核、账号内容编辑。

## 二、核心技术架构

### 前端
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- lucide-react 图标库

### 后端
- Next.js Route Handlers (同仓 API)
- JWT + HttpOnly Cookie 鉴权
- Zod 参数校验

### 数据层
- Prisma ORM
- MySQL

### 图片上传与压缩
- 发布账号时使用本地文件选择
- 通过 `/api/upload-images` 上传
- 服务端使用 `sharp` 自动压缩、统一转 WebP
- 落盘目录：`public/uploads`

## 三、主要功能

### 展示端
- 首页：推荐轮播、快捷入口、最新上架（不再放重筛选）
- 专用检索页：`/market`（多条件筛选）
- 账号详情：收藏、砍价、咨询客服、用户群入口
- 我的：
  - 我的发布
  - 修改个人信息
  - 修改密码
  - 管理员可见“后台管理”入口
  - 退出登录

### 后台端（/console）
- 数据总览（用户、账号状态、7日新增）
- 用户与权限管理：
  - 用户状态 ACTIVE/BANNED
  - 用户角色 USER/ADMIN
- 账号管理：
  - 审核（通过/驳回/下架）
  - 账号详情编辑（发布字段与图片）

## 四、启动方式

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
```

3. 同步数据库结构（远程库建议）
```bash
npx prisma db push --skip-generate
```

4. 生成 Prisma Client
```bash
npm run prisma:generate
```

5. 初始化管理员与默认配置（可选）
```bash
npm run prisma:seed
```

6. 启动开发
```bash
npm run dev
```

7. 构建验证
```bash
npx next build --no-lint
```

> 如果 `next build` 出现 `spawn EPERM`，请用管理员权限运行终端或允许提权执行。

## 五、关键路由

### 展示端
- `/` 首页
- `/market` 账号检索
- `/publish` 发布
- `/my` 我的
- `/my/profile` 修改资料
- `/my/security` 修改密码
- `/listing/[id]` 详情

### 后台端
- `/console/login` 后台登录
- `/console` 后台总览
- `/console/users` 用户与权限
- `/console/listings` 账号管理
- `/console/listings/[id]/edit` 编辑账号

## 六、补充说明

- 旧后台路由 `/admin/*` 已重定向到 `/console/*`。
- 底部导航遮挡问题已通过 `site-content` 安全区留白修复。