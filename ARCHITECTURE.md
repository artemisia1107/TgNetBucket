# TgNetBucket 架构文档

## 项目概述

TgNetBucket 是一个基于 Next.js 的文件存储和管理系统，使用 Telegram 作为存储后端。本文档描述了重构后的项目架构。

## 架构概览

```
TgNetBucket/
├── components/           # React 组件
│   ├── context/         # Context Providers
│   ├── features/        # 功能组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI 基础组件
├── hooks/               # 自定义 Hooks
├── pages/               # Next.js 页面
├── utils/               # 工具函数
├── constants/           # 常量配置
└── src/                 # 核心逻辑
```

## 核心架构模式

### 1. Context + Hooks 模式

项目采用 React Context + 自定义 Hooks 的状态管理模式：

- **Context Providers**: 提供全局状态管理
- **Custom Hooks**: 封装业务逻辑和状态操作
- **Components**: 纯展示组件，通过 Hooks 获取数据和方法

### 2. 分层架构

```
┌─────────────────┐
│   Components    │  ← 展示层
├─────────────────┤
│   Custom Hooks  │  ← 业务逻辑层
├─────────────────┤
│   Context API   │  ← 状态管理层
├─────────────────┤
│   Utils/API     │  ← 数据访问层
└─────────────────┘
```

## Context Providers

### AppContext
- **用途**: 全局应用状态管理
- **状态**: 主题、语言、用户信息、设置等
- **特性**: 支持本地存储持久化

### FileContext
- **用途**: 文件管理状态
- **状态**: 文件列表、上传状态、选择状态等
- **集成**: 整合 useFileManager 和 useFileUpload Hooks

### NotificationContext
- **用途**: 通知和消息管理
- **状态**: 消息、确认对话框、模态框、Toast等
- **特性**: 支持多种通知类型

## 自定义 Hooks

### 文件管理相关

#### useFileManager
```javascript
const {
  files,
  loading,
  error,
  searchFiles,
  deleteFile,
  downloadFile,
  generateShortLink
} = useFileManager();
```

#### useFileUpload
```javascript
const {
  uploadFiles,
  uploadSingleFile,
  uploadProgress,
  isUploading
} = useFileUpload();
```

#### useDebounce
```javascript
const debouncedValue = useDebounce(value, delay);
```

### 工具类 Hooks

#### useLocalStorage
```javascript
const [value, setValue] = useLocalStorage(key, defaultValue);
```

#### useApi
```javascript
const { request, loading, error } = useApi();
```

## 组件结构

### 功能组件 (features/)
- **FileBatch/**: 批量文件操作
- **FilePreview/**: 文件预览
- **FileUpload/**: 文件上传

### UI 组件 (ui/)
- **Message.js**: 消息提示组件
- **Modal.js**: 模态框组件
- **ProgressBar.js**: 进度条组件

### 布局组件 (layout/)
- 页面布局相关组件

## 状态管理流程

### 1. 文件上传流程
```
用户选择文件 → useFileUpload Hook → FileContext → 更新UI状态
```

### 2. 文件管理流程
```
用户操作 → useFileManager Hook → API调用 → FileContext → 更新文件列表
```

### 3. 通知流程
```
操作结果 → NotificationContext → 显示通知/Toast
```

## 数据流向

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   用户操作   │ →  │ Custom Hook │ →  │   Context   │
└─────────────┘    └─────────────┘    └─────────────┘
                           ↓                   ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   API调用    │ ←  │  Utils/API  │ ←  │  Component  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 最佳实践

### 1. 组件设计
- 保持组件纯净，避免直接状态管理
- 通过 Props 接收数据和回调函数
- 使用 Hooks 获取状态和方法

### 2. Hook 设计
- 单一职责原则
- 返回对象而非数组（便于解构）
- 提供清晰的错误处理

### 3. Context 使用
- 避免过度嵌套
- 合理拆分 Context（按功能域）
- 使用 useCallback 优化性能

### 4. 性能优化
- 使用 React.memo 包装组件
- 合理使用 useMemo 和 useCallback
- 避免不必要的重渲染

## 开发工作流

### 1. 添加新功能
1. 创建相关 Hook（如需要）
2. 更新对应 Context（如需要）
3. 创建/更新组件
4. 添加测试

### 2. 修改现有功能
1. 识别相关 Hook 和 Context
2. 更新业务逻辑
3. 更新组件（如需要）
4. 更新测试

## 配置文件

### ESLint (.eslintrc.json)
- 代码质量检查
- React/Next.js 最佳实践

### Prettier (.prettierrc)
- 代码格式化
- 统一代码风格

### TypeScript (tsconfig.json)
- 类型检查支持
- 路径别名配置

## 部署和构建

### 可用脚本
- `npm run dev`: 开发服务器
- `npm run build`: 生产构建
- `npm run start`: 生产服务器
- `npm run lint`: 代码检查
- `npm run format`: 代码格式化

### 环境配置
- 开发环境: `.env.local`
- 生产环境: Vercel 环境变量

## 扩展指南

### 添加新的 Context
1. 在 `components/context/` 创建新文件
2. 定义 Context、Provider 和 Hook
3. 在 `components/context/index.js` 中导出
4. 在 `GlobalProvider` 中集成

### 添加新的 Hook
1. 在 `hooks/` 目录创建新文件
2. 实现 Hook 逻辑
3. 在 `hooks/index.js` 中导出
4. 添加相关测试

这个架构设计确保了代码的可维护性、可扩展性和性能优化。