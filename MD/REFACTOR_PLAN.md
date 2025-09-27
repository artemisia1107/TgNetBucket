# TgNetBucket 项目重构计划

## 当前问题分析

### 大文件分析
1. **index.js (896行)** - 主页面组件，包含多个复杂功能
2. **common.js (440行)** - 公共组件库，功能混杂
3. **admin.js** - 管理页面，功能相对集中但可优化

### 主要问题
- 单文件过大，难以维护
- 功能耦合度高
- 缺乏模块化设计
- 代码复用性差

## 重构目标

### 1. 模块化设计
- 按功能拆分组件
- 提取可复用的业务逻辑
- 创建专用的工具函数库

### 2. 目录结构优化
```
components/
├── ui/              # UI组件
│   ├── Message.js   # 消息提示组件
│   ├── Modal.js     # 模态框组件
│   ├── ProgressBar.js # 进度条组件
│   └── FileCard.js  # 文件卡片组件
├── features/        # 功能组件
│   ├── FileUpload/  # 文件上传功能
│   ├── FileBatch/   # 批量操作功能
│   └── FilePreview/ # 文件预览功能
└── layout/          # 布局组件
    ├── Header.js
    ├── Footer.js
    └── AdminHeader.js

hooks/               # React Hooks
├── useFileUpload.js # 文件上传逻辑
├── useFileList.js   # 文件列表管理
└── useBatchOps.js   # 批量操作逻辑

utils/               # 工具函数
├── fileUtils.js     # 文件相关工具
├── formatUtils.js   # 格式化工具
├── apiUtils.js      # API工具
└── animationUtils.js # 动画工具

constants/           # 常量配置
├── fileTypes.js     # 文件类型配置
├── apiEndpoints.js  # API端点配置
└── uiConstants.js   # UI常量
```

## 拆分计划

### 第一阶段：UI组件拆分
1. 从common.js提取UI组件
2. 创建独立的组件文件
3. 保持API兼容性

### 第二阶段：功能模块拆分
1. 拆分index.js的文件上传功能
2. 拆分批量操作功能
3. 拆分文件预览功能

### 第三阶段：业务逻辑提取
1. 创建React Hooks
2. 提取状态管理逻辑
3. 优化API调用

### 第四阶段：工具函数整理
1. 分类整理工具函数
2. 创建专用工具模块
3. 优化函数性能

## 实施步骤

### 步骤1：创建目录结构
- 创建新的目录结构
- 保持向后兼容

### 步骤2：拆分UI组件
- Message组件 (createMessage)
- Modal组件 (createConfirmDialog)
- ProgressBar组件
- FileCard组件

### 步骤3：拆分功能组件
- FileUpload组件
- FileBatch组件
- FilePreview组件

### 步骤4：创建Hooks
- useFileUpload
- useFileList
- useBatchOps

### 步骤5：整理工具函数
- 文件工具函数
- 格式化工具函数
- 动画工具函数

### 步骤6：测试和优化
- 功能测试
- 性能优化
- 代码清理

## 预期收益

1. **可维护性提升** - 代码结构清晰，易于理解和修改
2. **复用性增强** - 组件和函数可在多处使用
3. **开发效率提高** - 模块化开发，减少重复代码
4. **测试友好** - 独立模块便于单元测试
5. **团队协作** - 清晰的代码结构便于多人协作

## 风险控制

1. **渐进式重构** - 分步骤进行，避免大规模改动
2. **向后兼容** - 保持现有API不变
3. **充分测试** - 每个步骤都进行功能测试
4. **回滚准备** - 保留原始代码，便于回滚