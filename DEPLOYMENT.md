# EBS 部署报告

**部署时间:** 2026-03-19 17:21 (Asia/Shanghai)
**部署机器:** openclaw-Standard-PC-Q35-ICH9-2009
**Git 提交 SHA:** `ca3083f9e71203cabce4a39716847900f28e8478` (main 分支)

---

## 部署步骤

### 1. 拉取代码
```bash
git clone git@github.com:hyz2023/ebs.git
cd ebs
git checkout main
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建前端
```bash
npm run build
```

### 4. 运行生产服务
```bash
npx tsx src/server/prod-index.ts &
```

---

## 服务状态

### 运行命令
```bash
npx tsx src/server/prod-index.ts
```

### 监听端口
- **端口:** 3000
- **绑定地址:** 0.0.0.0 (所有网络接口)
- **进程 PID:** 307215

### 健康检查结果
```bash
$ curl -s http://localhost:3000/api/health
{"status":"ok"}
```

✅ API 健康检查通过
✅ 前端静态资源正常服务

---

## 数据持久化

### 数据库文件位置
```
/home/openclaw/.openclaw/workspace/ebs/ebs.sqlite
```
- 大小: 24KB
- 类型: SQLite 3 (better-sqlite3)

### 备份文件位置
```
/home/openclaw/.openclaw/workspace/ebs/backups/
```
- 备份文件: `ebs-2026-03-19T09-21-07.377Z.sqlite`
- 备份大小: 24KB

### 备份命令
```bash
cd /home/openclaw/.openclaw/workspace/ebs
EBS_DB_PATH=ebs.sqlite EBS_BACKUP_DIR=backups npx tsx src/server/scripts/backup-db.ts
```

---

## 访问地址

**最终访问地址:** http://localhost:3000

如需从局域网其他设备访问，使用机器 IP 地址:
```
http://<机器IP>:3000
```

---

## 重启方式

### 手动重启
```bash
# 停止现有进程
pkill -f "tsx src/server/prod-index.ts"

# 重新启动
cd /home/openclaw/.openclaw/workspace/ebs
npx tsx src/server/prod-index.ts &
```

### 推荐：使用 systemd (可选)
创建 `/etc/systemd/system/ebs.service`:
```ini
[Unit]
Description=EBS Production Server
After=network.target

[Service]
Type=simple
User=openclaw
WorkingDirectory=/home/openclaw/.openclaw/workspace/ebs
ExecStart=/usr/bin/npx tsx src/server/prod-index.ts
Restart=always
Environment=PORT=3000
Environment=EBS_DB_PATH=ebs.sqlite

[Install]
WantedBy=multi-user.target
```

启用服务:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ebs
sudo systemctl start ebs
```

---

## 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3000 | 后端服务端口 |
| `EBS_DB_PATH` | ebs.sqlite | 数据库文件路径 |
| `EBS_BACKUP_DIR` | backups | 备份目录 |

---

## 项目结构 (部署相关)

```
ebs/
├── dist/                 # 前端生产构建输出
│   ├── index.html
│   └── assets/
├── src/server/
│   ├── prod-index.ts     # 生产启动入口 (新增)
│   ├── app.ts            # Express 应用
│   └── scripts/
│       └── backup-db.ts  # 备份脚本
├── ebs.sqlite            # SQLite 数据库文件
├── backups/              # 数据库备份目录
└── package.json
```

---

## 验证清单

- [x] Git main 分支最新代码
- [x] 依赖安装完成 (332 个包)
- [x] 前端构建成功 (dist/)
- [x] 生产服务运行中 (端口 3000)
- [x] API 健康检查通过
- [x] 前端页面可访问
- [x] SQLite 数据库文件创建
- [x] 备份目录创建
- [x] 备份演练成功

---

**部署完成 ✅**
