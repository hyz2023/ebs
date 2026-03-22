# Release v1.1.0

**发布日期：** 2026-03-22
**版本：** v1.1.0
**Git 标签：** v1.1.0

---

## 🚀 新功能

### 补结算
- ✅ 首页支持选择日期进行补结算
- ✅ 可选日期范围：2026-03-21 至今天
- ✅ 自动排除已结算日期
- ✅ 切换日期时重置勾选状态
- ✅ 按钮文字根据日期动态显示「立即结算」或「补结算」

### 规则说明页面
- ✅ 新增 `/rules` 路由
- ✅ 活动周期、每日结算等级（1/2/3）说明
- ✅ 新手保护期说明（2026-03-21 至 2026-03-23）
- ✅ 连胜奖励里程碑（3/7/14/21 天）
- ✅ 每日任务清单、外部奖惩、最终结算公式
- ✅ 风格与 EBS 主系统一致（深色游戏化平台风格）

### 资产页面重构
- ✅ 整合行为日历（原独立 CalendarPage 合并至 AssetsPage）
- ✅ 月份切换导航
- ✅ 收益构成图表
- ✅ 护盾获得/使用记录列表

### 底部导航优化
- ✅ 改为 4 栏 grid 布局：首页 | 资产 | 流水 | 规则
- ✅ 修复导航项重叠问题

## 🔧 修复与优化

- ✅ 新手保护期日期修正为 2026-03-21 至 2026-03-23
- ✅ 补结算起始日期修正为 2026-03-21
- ✅ 服务端 rules.ts 和客户端 date.ts 新手保护期判断同步更新
- ✅ 删除独立 CalendarPage 及其测试文件
- ✅ 新增 shields 和 calendar 报表 API
- ✅ 配置 systemd 用户服务，实现开机自启和崩溃自动恢复

## 📦 技术栈

- React 19 + Vite + React Router
- Node.js + TypeScript + Express
- SQLite（better-sqlite3）

## 🗂️ 新增/修改文件

### 新增
- `src/client/routes/RulesPage.tsx` — 规则说明页面
- `scripts/` — 工具脚本目录
- `src/server/scripts/reset-today.ts`

### 修改
- `src/client/App.tsx` — 新增规则路由
- `src/client/components/BottomNav.tsx` — 4 栏 grid 布局
- `src/client/components/TodaySettlementCard.tsx` — 补结算日期选择
- `src/client/routes/AssetsPage.tsx` — 重构为日历+收益+道具
- `src/client/styles/app.css` — 规则页面样式、导航布局修复
- `src/client/lib/date.ts` — 新手保护期日期更新
- `src/server/domain/rules.ts` — 新手保护期日期更新
- `src/server/domain/reports.ts` — 新增报表查询
- `src/server/routes/reports.ts` — 新增报表路由

### 删除
- `src/client/routes/CalendarPage.tsx`
- `src/client/tests/CalendarPage.test.tsx`

## 🔄 回滚方法

```bash
git checkout v1.0.0
npm run build
systemctl --user restart ebs
```

## 📋 后续优化方向

- 补结算时显示已结算/未结算日期的视觉区分
- 规则页面增加动画或交互效果
- 考虑将 TimeBank 也配置为 systemd 服务
