# EBS

Elite Boarding-student System（精英住校生系统）是一个手机优先的 Web 应用，用来记录每日表现、计算奖励与连胜、查看行为日历和金融报表。

## 技术栈

- 前端：React 19 + Vite + React Router
- 后端：Node.js + TypeScript + Express
- 数据库：SQLite（单文件）
- 测试：Vitest + Testing Library + Supertest

## 本地开发

安装依赖：

```bash
npm install
```

启动前后端开发环境：

```bash
npm run dev
```

默认地址：

- 前端：[http://localhost:5173](http://localhost:5173)
- 后端：[http://localhost:3000](http://localhost:3000)

## 常用命令

```bash
npm run test
npm run test:server
npm run build
npm run backup:db
```

## 数据与备份

- 默认数据库文件：`ebs.sqlite`
- 默认备份目录：`backups/`
- 执行备份命令后，会生成带时间戳的 SQLite 文件副本

可选环境变量：

- `PORT`：后端端口，默认 `3000`
- `EBS_DB_PATH`：备份脚本读取的数据库文件路径，默认 `ebs.sqlite`
- `EBS_BACKUP_DIR`：备份输出目录，默认 `backups`

## 主要页面

- `今日`：每日结算、护盾确认、新手保护提示、结算结果
- `日历`：行为日历与日期详情
- `资产`：余额走势、收益构成、里程碑、最终结算预览
- `流水`：事件流水与外部奖惩录入

## 目录结构

```text
src/
  client/        React 前端
  server/        Express 服务端与 SQLite 逻辑
docs/
  superpowers/
    specs/       产品设计文档
    plans/       实施计划
```

## 当前实现说明

- 单家庭、单账户，无登录
- 账户与规则计算全部在服务端执行
- 适合低性能机器部署，数据库与备份均为本地文件
