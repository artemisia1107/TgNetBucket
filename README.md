# TgNetBucket

TgNetBucket是一个使用Telegram作为存储后端的文件存储服务，通过Vercel托管前后端页面进行管理。

## 功能特点

- 使用Telegram Bot API存储文件
- 支持文件上传、下载、列表查看和删除
- 简洁美观的Web界面
- 易于部署到Vercel平台

## 快速开始

### 前提条件

1. 创建一个Telegram Bot（通过BotFather）
2. 获取Bot Token和Chat ID
3. 注册Vercel账号

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/yourusername/TgNetBucket.git
cd TgNetBucket
```

2. 安装依赖
```bash
npm install
```

3. 创建`.env.local`文件并添加以下内容
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

4. 启动开发服务器
```bash
npm run dev
```

5. 在浏览器中访问 http://localhost:3000

### 部署到Vercel

1. 在Vercel中导入GitHub仓库

2. 在环境变量中添加：
   - `TELEGRAM_BOT_TOKEN`: 你的Telegram Bot Token
   - `TELEGRAM_CHAT_ID`: 你的Telegram Chat ID

3. 部署项目

## 技术栈

- Next.js - React框架
- Node.js - 后端运行环境
- Telegram Bot API - 文件存储
- Vercel - 部署和托管

## 项目结构

```
TgNetBucket/
├── pages/            # Next.js页面
│   ├── api/          # API接口
│   │   ├── files.js  # 文件管理API
│   │   └── download.js # 文件下载API
│   └── index.js      # 主页面
├── src/              # 源代码
│   └── telegram_storage.js # Telegram存储实现
├── tests/            # 测试文件
│   └── telegram_storage_test.js # 存储功能测试
├── package.json      # 项目依赖
├── vercel.json       # Vercel配置
└── README.md         # 项目说明
```

## 许可证

MIT
