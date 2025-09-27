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

3. 创建`.env.local`文件并添加以下内容（可以参考`.env.local.example`）
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

   **获取配置信息：**
   - `TELEGRAM_BOT_TOKEN`: 通过 [@BotFather](https://t.me/BotFather) 创建Bot后获得
   - `TELEGRAM_CHAT_ID`: 可以是个人聊天ID或群组ID，用于存储文件

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
├── .env.local.example # 环境变量配置模板
├── package.json      # 项目依赖
├── vercel.json       # Vercel配置
└── README.md         # 项目说明
```

## 故障排除

### 文件上传失败 (500错误)

如果遇到文件上传失败的问题，请检查以下几点：

1. **环境变量配置**
   - 确保 `TELEGRAM_BOT_TOKEN` 和 `TELEGRAM_CHAT_ID` 已正确配置
   - 在Vercel部署时，需要在项目设置的Environment Variables中添加这些变量

2. **Bot权限**
   - 确保Bot有权限向指定的聊天发送消息
   - 如果使用群组ID，确保Bot已被添加到群组中

3. **文件大小限制**
   - Telegram Bot API对文件大小有限制（最大50MB）
   - 确保上传的文件不超过此限制

### 常见问题

**Q: 为什么文件列表为空？**
A: 由于Telegram Bot API的限制，无法直接获取历史消息。文件列表基于内存存储，应用重启后会丢失。建议使用数据库存储文件信息。

**Q: 如何获取Chat ID？**
A: 可以向Bot发送消息，然后访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` 查看消息中的chat id。

**Q: 部署后仍然出现500错误？**
A: 检查Vercel的Function Logs，查看详细的错误信息。通常是环境变量配置问题。

## 更新日志

### v0.2.0 (最新)
- 🐛 修复文件上传500错误问题
- 🔧 将模块系统从CommonJS改为ES6模块语法，提高Next.js兼容性
- 📝 改进错误处理和日志记录，提供更详细的调试信息
- 📄 添加`.env.local.example`环境变量配置模板
- 📚 完善README文档，添加故障排除指南

### v0.1.0
- ✨ 初始版本发布
- 🚀 基本的文件上传、下载、列表和删除功能
- 🎨 简洁的Web界面
- 📦 支持Vercel部署

## 许可证

MIT
