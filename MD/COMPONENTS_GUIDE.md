# 组件使用指南

本文档详细介绍了 TgNetBucket 项目中所有组件的使用方法、Props 接口和最佳实践。

## 目录

- [Context Providers](#context-providers)
- [UI 组件](#ui-组件)
- [功能组件](#功能组件)
- [布局组件](#布局组件)
- [页面组件](#页面组件)

## Context Providers

### GlobalProvider

全局状态提供者，组合了所有 Context Providers。

#### 基本用法

```javascript
// pages/_app.js
import { GlobalProvider } from '@/components/context';

function MyApp({ Component, pageProps }) {
  return (
    <GlobalProvider>
      <Component {...pageProps} />
    </GlobalProvider>
  );
}

export default MyApp;
```

### AppProvider

应用级状态管理，提供主题、语言、用户信息等全局状态。

#### 基本用法

```javascript
import { AppProvider, useApp } from '@/components/context';

function App() {
  return (
    <AppProvider>
      <ThemeToggle />
      <LanguageSelector />
    </AppProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useApp();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      当前主题: {theme}
    </button>
  );
}
```

#### 状态说明

| 状态 | 类型 | 描述 |
|------|------|------|
| `theme` | `string` | 主题模式 ('light' \| 'dark') |
| `language` | `string` | 语言设置 ('zh' \| 'en') |
| `user` | `object\|null` | 用户信息 |
| `settings` | `object` | 应用设置 |
| `loading` | `boolean` | 全局加载状态 |
| `error` | `string\|null` | 全局错误信息 |

### FileProvider

文件管理状态提供者，管理文件列表、上传状态等。

#### 基本用法

```javascript
import { FileProvider, useFileContext } from '@/components/context';

function FileManager() {
  return (
    <FileProvider>
      <FileList />
      <FileUpload />
    </FileProvider>
  );
}

function FileList() {
  const { files, selectedFiles, selectFile } = useFileContext();
  
  return (
    <div>
      {files.map(file => (
        <div key={file.id}>
          <input
            type="checkbox"
            checked={selectedFiles.has(file.id)}
            onChange={() => selectFile(file.id)}
          />
          <span>{file.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### NotificationProvider

通知系统提供者，管理消息、确认对话框、模态框等。

#### 基本用法

```javascript
import { NotificationProvider, useNotification } from '@/components/context';

function App() {
  return (
    <NotificationProvider>
      <MainContent />
      {/* 通知组件会自动渲染 */}
    </NotificationProvider>
  );
}

function MainContent() {
  const { showMessage, showConfirm, showToast } = useNotification();
  
  const handleAction = async () => {
    const confirmed = await showConfirm('确定要执行此操作吗？');
    if (confirmed) {
      // 执行操作
      showToast('操作成功', 'success');
    }
  };
  
  return (
    <button onClick={handleAction}>执行操作</button>
  );
}
```

## UI 组件

### Message

消息提示组件，用于显示各种类型的消息。

#### Props 接口

```typescript
interface MessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}
```

#### 基本用法

```javascript
import { Message } from '@/components/ui';

function App() {
  const [message, setMessage] = useState(null);
  
  return (
    <div>
      {message && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
          autoClose={true}
          duration={3000}
        />
      )}
      
      <button onClick={() => setMessage({ type: 'success', text: '操作成功' })}>
        显示成功消息
      </button>
    </div>
  );
}
```

#### 样式类名

- `.message` - 基础样式
- `.message-success` - 成功消息
- `.message-error` - 错误消息
- `.message-warning` - 警告消息
- `.message-info` - 信息消息

### Modal

模态框组件，用于显示对话框、表单等内容。

#### Props 接口

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
}
```

#### 基本用法

```javascript
import { Modal } from '@/components/ui';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        打开模态框
      </button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="确认操作"
        size="medium"
        closable={true}
        maskClosable={true}
      >
        <div>
          <p>确定要执行此操作吗？</p>
          <div className="modal-actions">
            <button onClick={() => setIsModalOpen(false)}>取消</button>
            <button onClick={() => {
              // 执行操作
              setIsModalOpen(false);
            }}>确认</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

#### 高级用法

```javascript
// 自定义样式
<Modal
  isOpen={isOpen}
  onClose={onClose}
  className="custom-modal"
  size="large"
>
  <div className="custom-content">
    {/* 自定义内容 */}
  </div>
</Modal>

// 不可关闭的模态框
<Modal
  isOpen={isOpen}
  onClose={onClose}
  closable={false}
  maskClosable={false}
>
  <div>
    <p>正在处理，请稍候...</p>
    <ProgressBar progress={progress} />
  </div>
</Modal>
```

### ProgressBar

进度条组件，用于显示操作进度。

#### Props 接口

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  showText?: boolean;
  text?: string;
  color?: string;
  height?: number;
  className?: string;
  animated?: boolean;
}
```

#### 基本用法

```javascript
import { ProgressBar } from '@/components/ui';

function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  return (
    <div>
      <ProgressBar
        progress={uploadProgress}
        showText={true}
        text={`上传进度: ${uploadProgress}%`}
        color="#4CAF50"
        height={20}
        animated={true}
      />
    </div>
  );
}
```

#### 样式定制

```css
/* 自定义进度条样式 */
.custom-progress {
  border-radius: 10px;
  background: #f0f0f0;
}

.custom-progress .progress-fill {
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 10px;
}
```

## 功能组件

### FileBatch

批量文件操作组件，提供文件选择、批量删除等功能。

#### Props 接口

```typescript
interface FileBatchProps {
  files: File[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onSelectAll: () => void;
  onBatchDelete: () => void;
  onBatchDownload?: () => void;
  className?: string;
}
```

#### 基本用法

```javascript
import { FileBatch } from '@/components/features/FileBatch';

function FileManager() {
  const {
    files,
    selectedFiles,
    selectFile,
    handleSelectAll,
    handleBatchDelete
  } = useFileManager();
  
  return (
    <FileBatch
      files={files}
      selectedFiles={selectedFiles}
      onSelectFile={selectFile}
      onSelectAll={handleSelectAll}
      onBatchDelete={handleBatchDelete}
    />
  );
}
```

### FilePreview

文件预览组件，支持多种文件类型的预览。

#### Props 接口

```typescript
interface FilePreviewProps {
  file: File;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}
```

#### 基本用法

```javascript
import { FilePreview } from '@/components/features/FilePreview';

function FileList() {
  const [previewFile, setPreviewFile] = useState(null);
  
  return (
    <div>
      {files.map(file => (
        <div key={file.id}>
          <span>{file.name}</span>
          <button onClick={() => setPreviewFile(file)}>
            预览
          </button>
        </div>
      ))}
      
      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={() => downloadFile(previewFile)}
          onDelete={() => {
            deleteFile(previewFile.id);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}
```

### FileUpload

文件上传组件，支持拖拽上传、多文件选择等。

#### Props 接口

```typescript
interface FileUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

#### 基本用法

```javascript
import { FileUpload } from '@/components/features/FileUpload';

function UploadArea() {
  const { uploadFiles, isUploading } = useFileUpload();
  
  return (
    <FileUpload
      onUpload={uploadFiles}
      multiple={true}
      accept="image/*,application/pdf"
      maxSize={10 * 1024 * 1024} // 10MB
      disabled={isUploading}
    >
      <div className="upload-area">
        <p>拖拽文件到此处或点击选择文件</p>
        <p>支持图片和PDF文件，最大10MB</p>
      </div>
    </FileUpload>
  );
}
```

## 布局组件

### Header

页面头部组件。

#### Props 接口

```typescript
interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
  actions?: React.ReactNode;
  className?: string;
}
```

#### 基本用法

```javascript
import { Header } from '@/components';

function Layout() {
  return (
    <div>
      <Header
        title="文件管理"
        showSearch={true}
        onSearch={(term) => console.log('搜索:', term)}
        actions={
          <div>
            <button>上传</button>
            <button>设置</button>
          </div>
        }
      />
      {/* 页面内容 */}
    </div>
  );
}
```

### Footer

页面底部组件。

#### 基本用法

```javascript
import { Footer } from '@/components';

function Layout() {
  return (
    <div>
      {/* 页面内容 */}
      <Footer />
    </div>
  );
}
```

## 最佳实践

### 1. 组件组合

```javascript
// 推荐：组合小组件构建复杂功能
function FileManagerPage() {
  return (
    <div className="file-manager">
      <Header title="文件管理" showSearch={true} />
      
      <div className="content">
        <FileUpload onUpload={handleUpload} />
        <FileBatch {...batchProps} />
        <FileList files={files} />
      </div>
      
      <Footer />
    </div>
  );
}
```

### 2. Props 传递优化

```javascript
// 使用对象展开减少 Props 传递
function FileManager() {
  const fileManagerProps = useFileManager();
  
  return (
    <FileBatch {...fileManagerProps} />
  );
}
```

### 3. 条件渲染

```javascript
function ConditionalComponent() {
  const { loading, error, data } = useApi();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
}
```

### 4. 事件处理优化

```javascript
function OptimizedComponent() {
  // 使用 useCallback 优化事件处理函数
  const handleClick = useCallback((id) => {
    // 处理点击事件
  }, []);
  
  const handleChange = useCallback((value) => {
    // 处理变化事件
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          onClick={() => handleClick(item.id)}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
```

### 5. 样式管理

```javascript
// 使用 CSS 模块或 styled-components
import styles from './Component.module.css';

function StyledComponent({ className, ...props }) {
  return (
    <div 
      className={`${styles.component} ${className || ''}`}
      {...props}
    >
      {/* 组件内容 */}
    </div>
  );
}
```

### 6. 错误边界

```javascript
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('组件错误:', error, errorInfo);
      }}
    >
      <FileManager />
    </ErrorBoundary>
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-fallback">
      <h2>出现了错误</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}
```

## 常见问题

### Q: 如何自定义组件样式？

A: 使用 className prop 和 CSS 模块：

```javascript
// 组件定义
function CustomComponent({ className, ...props }) {
  return (
    <div className={`base-class ${className || ''}`} {...props}>
      {/* 内容 */}
    </div>
  );
}

// 使用
<CustomComponent className="my-custom-style" />
```

### Q: 如何处理组件的异步状态？

A: 使用 Suspense 和 ErrorBoundary：

```javascript
function AsyncComponent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <DataComponent />
      </ErrorBoundary>
    </Suspense>
  );
}
```

### Q: 如何优化大列表渲染性能？

A: 使用虚拟化或分页：

```javascript
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <Item data={items[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </List>
  );
}
```

这个指南涵盖了项目中所有组件的使用方法和最佳实践，帮助开发者更好地理解和使用组件系统。