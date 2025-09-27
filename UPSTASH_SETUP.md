# Upstash Redis 配置指南

本项目支持使用 [Upstash](https://upstash.com/) 的免费 Redis 数据库来持久化存储文件列表，解决无服务器环境中内存存储丢失的问题。

## 为什么使用 Upstash Redis？

1. **免费额度充足** <mcreference link="https://upstash.com/" index="0">0</mcreference>：每月 10,000 次请求，对于个人使用完全足够
2. **无服务器友好**：专为 Vercel、Netlify 等平台优化
3. **全球低延迟**：多区域部署，响应速度快
4. **零配置维护**：无需管理服务器，自动扩缩容

## 配置步骤

### 1. 创建 Upstash 账户

1. 访问 [https://upstash.com/](https://upstash.com/)
2. 点击 "Sign Up" 注册账户（支持 GitHub/Google 登录）
3. 验证邮箱完成注册

### 2. 创建 Redis 数据库

1. 登录后点击 "Create Database"
2. 选择 "Redis" 类型
3. 配置数据库：
   - **Name**: 输入数据库名称（如：tg-net-bucket）
   - **Region**: 选择离你最近的区域
   - **Type**: 选择 "Free" 免费版本
4. 点击 "Create" 创建数据库

### 3. 获取连接信息

1. 在数据库列表中点击刚创建的数据库
2. 在 "REST API" 标签页中找到：
   - **UPSTASH_REDIS_REST_URL**: REST API 端点
   - **UPSTASH_REDIS_REST_TOKEN**: 访问令牌

### 4. 配置环境变量

1. 复制 `.env.local.example` 为 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local` 文件，添加 Upstash 配置：
   ```env
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here

   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

### 5. Vercel 部署配置

如果使用 Vercel 部署，需要在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel 项目设置
2. 点击 "Environment Variables"
3. 添加以下变量：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

## 功能说明

### 数据存储结构

- **文件列表**: `files:{chatId}` - 存储该聊天的所有文件信息
- **单个文件**: `file:{fileId}` - 存储单个文件的详细信息（30天过期）

### 自动同步机制

1. **首次访问**: 如果 Redis 中没有数据，自动从 Telegram 同步最近 100 条消息中的文件
2. **新文件上传**: 自动添加到 Redis 存储
3. **文件删除**: 同时从 Telegram 和 Redis 中删除

### 降级策略

如果没有配置 Upstash Redis，系统会自动降级到内存存储模式：
- 适用于开发环境
- 每次重启会丢失文件列表
- 不影响 Telegram 中的实际文件

## 监控和管理

### Upstash 控制台

在 Upstash 控制台中可以：
- 查看数据库使用情况
- 监控请求次数和延迟
- 管理数据库连接
- 查看存储的数据

### 数据清理

Redis 中的数据会自动管理：
- 文件信息设置 30 天过期时间
- 可以手动清理不需要的数据
- 删除文件时自动清理相关数据

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 URL 和 Token 是否正确
   - 确认网络连接正常
   - 查看 Upstash 控制台是否有错误信息

2. **文件列表为空**
   - 检查 Telegram 聊天中是否有文档消息
   - 确认 `TELEGRAM_CHAT_ID` 配置正确
   - 查看服务器日志中的同步信息

3. **权限错误**
   - 确认 Redis Token 有效
   - 检查 Upstash 数据库状态

### 日志信息

系统会输出相关日志：
- `Redis中无文件列表，从Telegram同步...`
- `从Telegram同步了 X 个文件到Redis`
- `已从Redis删除文件: filename`

## 成本估算

Upstash 免费版本包含：
- 10,000 次请求/月
- 256MB 存储空间
- 全球 CDN 加速

对于个人使用，这个额度通常足够：
- 每次文件上传：~3 次请求
- 每次查看文件列表：~1 次请求
- 每次文件删除：~2 次请求

如果超出免费额度，可以升级到付费计划，按使用量计费。