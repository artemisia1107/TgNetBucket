# TgNetBucket

TgNetBucket是一个使用Telegram作为存储后端的文件存储服务，通过Vercel托管前后端页面进行管理。

## ✨ 功能特点

- 🚀 **Telegram存储**: 使用Telegram Bot API作为文件存储后端
- 📁 **完整管理**: 支持文件上传、下载、列表查看和删除
- 💾 **持久化存储**: 集成Upstash Redis，确保数据持久性
- 🎨 **现代化UI**: 渐变背景、毛玻璃效果、响应式设计
- 🖋️ **优雅字体**: LXGW文楷字体集成，完美中英文混排
- ☁️ **一键部署**: 支持Vercel平台快速部署
- 🔄 **智能降级**: 确保服务稳定性，Redis不可用时自动切换
- 🌍 **全球访问**: 低延迟的全球访问体验

## 🖼️ 界面预览

### 主要特色
- **现代化设计**: 紫色渐变背景（#667eea → #764ba2），毛玻璃效果卡片
- **拖拽上传**: 支持直接拖拽文件到上传区域
- **流畅动画**: 淡入、滑动和缩放动画效果
- **响应式布局**: 完美适配桌面、平板和手机设备
- **管理面板**: 侧边栏导航，数据可视化，实时监控

## 📋 支持的文件类型

| 文件类别 | 支持格式 | 推荐大小 |
|---------|---------|---------|
| 📄 **文档** | PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT | < 20MB |
| 🖼️ **图片** | JPG, PNG, GIF, BMP, SVG, WebP, ICO | < 10MB |
| 🎵 **音频** | MP3, WAV, FLAC, AAC, OGG, M4A | < 30MB |
| 🎬 **视频** | MP4, AVI, MKV, MOV, WMV, FLV | < 50MB |
| 📦 **压缩** | ZIP, RAR, 7Z, TAR, GZ, BZ2 | < 50MB |
| 💻 **程序** | EXE, MSI, APK, DEB, RPM | < 50MB |

**限制说明**:
- 单文件最大: 50MB（Telegram API限制）
- 推荐大小: < 25MB（确保稳定性）
- 文件数量: 无限制

## 🚀 快速开始

### 前提条件
1. 创建Telegram Bot（通过[@BotFather](https://t.me/BotFather)）
2. 获取Bot Token和Chat ID
3. 注册Vercel账号

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/TgNetBucket.git
cd TgNetBucket

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 文件，添加你的配置

# 4. 启动开发服务器
npm run dev
```

### 环境变量配置

在`.env.local`文件中添加以下配置：

```env
# Telegram配置（必需）
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Upstash Redis配置（可选，推荐）
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 部署到Vercel

1. 在Vercel中导入GitHub仓库
2. 在环境变量中添加上述配置
3. 一键部署

> 💡 **提示**: 虽然Redis配置是可选的，但强烈建议在生产环境中配置以获得更好的持久化体验。

## 🏗️ 系统架构

```mermaid
graph TB
    A[Web界面] --> B[Next.js应用]
    B --> C[文件管理API]
    C --> D[TelegramStorage]
    D --> E[Redis客户端]
    D --> F[Telegram Bot API]
    E --> G[Upstash Redis]
    F --> H[Telegram服务器]
    B --> I[Vercel无服务器]
```

## 🛠️ 技术栈

- **前端**: Next.js + 现代化CSS3
- **字体**: LXGW文楷字体系统
- **存储**: Telegram Bot API + Upstash Redis
- **部署**: Vercel无服务器平台
- **运行环境**: Node.js

## 📁 项目结构

```
TgNetBucket/
├── pages/                    # Next.js页面和API路由
│   ├── api/                 # API端点
│   ├── admin.js             # 管理面板页面
│   └── index.js             # 主页面
├── components/               # 组件化架构
│   ├── features/            # 功能组件
│   │   ├── FileUpload/      # 文件上传组件
│   │   ├── FileBatch/       # 批量操作组件
│   │   └── FilePreview/     # 文件预览组件
│   ├── ui/                  # 通用UI组件
│   │   ├── FileCard.js      # 文件卡片
│   │   ├── Message.js       # 消息提示
│   │   ├── Modal.js         # 模态框
│   │   └── ProgressBar.js   # 进度条
│   ├── layout/              # 布局组件
│   │   ├── Header.js        # 页面头部
│   │   ├── Footer.js        # 页面底部
│   │   └── AdminHeader.js   # 管理头部
│   ├── context/             # React Context
│   │   ├── AppContext.js    # 应用上下文
│   │   ├── FileContext.js   # 文件上下文
│   │   └── NotificationContext.js # 通知上下文
│   └── common.js            # 通用组件工具
├── hooks/                    # 自定义React Hooks
│   ├── useFileList.js       # 文件列表管理
│   ├── useFileUpload.js     # 文件上传逻辑
│   ├── useBatchOps.js       # 批量操作
│   ├── useApi.js            # API调用封装
│   ├── useDebounce.js       # 防抖处理
│   ├── useLocalStorage.js   # 本地存储
│   ├── useFileManager.js    # 文件管理器
│   └── useAdminPanel.js     # 管理面板
├── utils/                    # 工具函数库
│   ├── fileUtils.js         # 文件处理工具
│   ├── formatUtils.js       # 格式化工具
│   ├── validationUtils.js   # 验证工具
│   ├── apiUtils.js          # API工具
│   └── commonUtils.js       # 通用工具
├── constants/                # 配置常量
│   ├── config.js            # 应用配置
│   ├── apiEndpoints.js      # API端点定义
│   ├── fileTypes.js         # 文件类型配置
│   └── uiConstants.js       # UI常量
├── public/                   # 静态资源
│   ├── fonts/               # LXGW文楷字体
│   └── styles/              # 模块化样式系统
├── src/                     # 核心源代码
│   ├── telegram_storage.js  # Telegram存储服务
│   ├── redis_client.js      # Redis客户端
│   └── mime_types.js        # MIME类型定义
├── tests/                   # 测试文件
└── MD/                      # 项目文档
    ├── ARCHITECTURE.md      # 架构说明
    ├── COMPONENTS_GUIDE.md  # 组件指南
    ├── HOOKS_GUIDE.md       # Hooks指南
    └── REFACTOR_PLAN.md     # 重构计划
```

## 📚 文档导航

### 核心文档
- **[Q&A.md](./MD/Q&A.md)** - 常见问题与故障排除
- **[UpdateLog.md](./MD/UpdateLog.md)** - 完整版本更新日志
- **[UPSTASH_SETUP.md](./MD/UPSTASH_SETUP.md)** - Redis配置详细指南

### 开发文档
- **[ARCHITECTURE.md](./MD/ARCHITECTURE.md)** - 项目架构详细说明
- **[COMPONENTS_GUIDE.md](./MD/COMPONENTS_GUIDE.md)** - 组件开发指南
- **[HOOKS_GUIDE.md](./MD/HOOKS_GUIDE.md)** - Hook使用指南
- **[REFACTOR_PLAN.md](./MD/REFACTOR_PLAN.md)** - 重构计划

## 📈 当前版本

### v1.0.0 - 组件化重构完成 (2025-9-28)

**🏗️ 架构重构**
- 完全组件化的React架构设计
- 模块化的自定义Hooks系统
- 统一的工具函数和常量管理
- 清晰的项目目录结构

**⚡ 功能增强**
- 文件上传、批量操作、预览功能完整实现
- React Context状态管理
- 性能优化和代码清理
- 完善的错误处理机制

**📚 文档完善**
- 详细的组件开发指南
- Hooks使用文档
- 架构设计说明
- 重构计划记录

> 📖 查看完整更新历史：[UpdateLog.md](./MD/UpdateLog.md)

## ❓ 需要帮助？

- 🔧 **遇到问题**: 查看 [Q&A.md](./MD/Q&A.md) 获取解决方案
- 🐛 **发现Bug**: 在GitHub Issues中提交问题
- 💡 **功能建议**: 参与GitHub Discussions讨论
- 📖 **深入了解**: 阅读项目架构和开发文档

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件
