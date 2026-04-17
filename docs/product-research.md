# 竞品调研：三国志战略版账号交易模块

更新时间：2026-04-16

## A. 参考站点

- 交易猫：https://www.jiaoyimao.com/
- 盼之代售：https://www.pzds.com/

## B. 交易猫（三国志战略版）提炼

### 1) 核心模块
- 列表页：搜索/筛选（系统、区服、价格、保障标签）+ 排序。
- 详情页：基础信息 + 资产分栏（武将、战法、装备、资产）+ 保障区。
- 交易流程：下单 → 支付 → 验号/确认 → 转移交付 → 完成。
- 风控保障：官方验号、账号转移、包赔机制、托管思路。
- 卖家画像：信誉、成交、店铺聚合。

### 2) 标签体系
- 保障标签：官方验号、账号转移、永久包赔。
- 资产标签：核心武将、战法深度、装备强度。
- 交易标签：可议价、急售、近期更新。

## C. 盼之代售提炼

### 1) 核心模块
- 首页分发：我要买/我要卖/中介担保/估值回收并列入口。
- 买号流程：商品详情包含价格、热度、收藏、保障标签、交易流程。
- 卖号流程：挂牌代售提交流程 + 审核。
- 安全模块：黑号查询、防钓鱼提示、帮助中心。

### 2) 平台化亮点
- 强入口转化（买卖担保回收）。
- 交易流程标准化（5步心智）。
- 安全心智持续强化（查询、案例、提示）。

## D. 我们平台落地映射

### 1) 已落地能力
- 移动端账号广场 + 多维筛选。
- 结构化详情（赛季、武将、战法、标签、保障）。
- 注册发布 + 后台审核。
- 卖家管理（下架、重提、已售）。
- 后台用户管理（封禁/解禁）。

### 2) 规划中（下一阶段）
- 订单托管与仲裁。
- 官方验号报告。
- 黑号查询与风险评分。
- 估值回收与自动议价。

## E. 数据字段建议（关键）

### Listing
- 基础：`id,title,priceCents,region,osPlatform,accountType,serverName,status`
- 资产：`seasonTier,seasonDays,heroCount,coreHeroCount,sTacticCount,treasureCount,skinsCount,score`
- 标签：`highlightTags,strategyTags,guaranteeTags`
- 保障：`supportBargain,isInsured`

### User
- `id,phone,nickname,passwordHash,role,status`

### Audit
- `listingId,adminId,action,reason,createdAt`

## F. 参考链接

- 交易猫三国志战略版商品页（PC）：https://www.jiaoyimao.com/jg1009207/1770236309892013.html
- 交易猫三国志战略版商品页（移动）：https://m.jiaoyimao.com/jg1009207/1760180126587730.html
- 交易猫账号流程指引（PDF）：https://image.uc.cn/s/uae/g/24/u_jym/%E4%BA%A4%E6%98%93%E7%8C%AB%E8%B4%A6%E5%8F%B7%E4%BD%93%E9%AA%8C%E6%B5%81%E7%A8%8B%E6%8C%87%E5%BC%95.pdf
- 盼之代售首页：https://www.pzds.com/
- 盼之代售游戏列表：https://www.pzds.com/gameList
- 盼之代售中介担保：https://www.pzds.com/Intermediary
- 盼之代售黑号查询：https://www.pzds.com/blackSign
- 盼之代售商品详情样例：https://m7.pzds.com/goodsDetails/C2TK1D/6