# Hooks 使用指南

本文档详细介绍了 TgNetBucket 项目中所有自定义 Hooks 的使用方法和最佳实践。

## 目录

- [文件管理 Hooks](#文件管理-hooks)
  - [useFileManager](#usefilemanager)
  - [useFileUpload](#usefileupload)
- [工具类 Hooks](#工具类-hooks)
  - [useDebounce](#usedebounce)
  - [useLocalStorage](#uselocalstorage)
  - [useApi](#useapi)
- [管理面板 Hooks](#管理面板-hooks)
  - [useAdminPanel](#useadminpanel)
- [Context Hooks](#context-hooks)
  - [useApp](#useapp)
  - [useFileContext](#usefilecontext)
  - [useNotification](#usenotification)

## 文件管理 Hooks

### useFileManager

文件管理的核心 Hook，提供文件列表管理、搜索、删除、下载等功能。

#### 基本用法

```javascript
import { useFileManager } from '@/hooks';

function FileList() {
  const {
    files,
    filteredFiles,
    loading,
    error,
    selectedFiles,
    searchFiles,
    selectFile,
    handleSelectAll,
    handleBatchDelete,
    deleteFile,
    downloadFile,
    generateShortLink,
    debouncedSearchTerm
  } = useFileManager();

  return (
    <div>
      {/* 搜索框 */}
      <input 
        type="text"
        onChange={(e) => searchFiles(e.target.value)}
        placeholder="搜索文件..."
      />
      
      {/* 文件列表 */}
      {loading ? (
        <div>加载中...</div>
      ) : (
        filteredFiles.map(file => (
          <div key={file.id}>
            <input
              type="checkbox"
              checked={selectedFiles.has(file.id)}
              onChange={() => selectFile(file.id)}
            />
            <span>{file.name}</span>
            <button onClick={() => downloadFile(file)}>下载</button>
            <button onClick={() => deleteFile(file.id)}>删除</button>
          </div>
        ))
      )}
    </div>
  );
}
```

#### 返回值说明

| 属性 | 类型 | 描述 |
|------|------|------|
| `files` | `Array` | 所有文件列表 |
| `filteredFiles` | `Array` | 过滤后的文件列表 |
| `loading` | `boolean` | 加载状态 |
| `error` | `string\|null` | 错误信息 |
| `selectedFiles` | `Set` | 已选择的文件ID集合 |
| `debouncedSearchTerm` | `string` | 防抖后的搜索词 |

#### 方法说明

| 方法 | 参数 | 描述 |
|------|------|------|
| `searchFiles` | `(term: string)` | 搜索文件 |
| `selectFile` | `(fileId: string)` | 切换文件选择状态 |
| `handleSelectAll` | `()` | 全选/取消全选 |
| `handleBatchDelete` | `()` | 批量删除选中文件 |
| `deleteFile` | `(fileId: string)` | 删除单个文件 |
| `downloadFile` | `(file: Object)` | 下载文件 |
| `generateShortLink` | `(file: Object)` | 生成短链接 |

### useFileUpload

文件上传功能的 Hook，支持单文件和多文件上传，提供上传进度跟踪。

#### 基本用法

```javascript
import { useFileUpload } from '@/hooks';

function FileUpload() {
  const {
    uploadFiles,
    uploadSingleFile,
    uploadProgress,
    isUploading,
    error
  } = useFileUpload();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    uploadFiles(files);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      
      {isUploading && (
        <div>
          <div>上传进度: {uploadProgress}%</div>
          <progress value={uploadProgress} max="100" />
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

#### 返回值说明

| 属性 | 类型 | 描述 |
|------|------|------|
| `uploadProgress` | `number` | 上传进度 (0-100) |
| `isUploading` | `boolean` | 是否正在上传 |
| `error` | `string\|null` | 上传错误信息 |

#### 方法说明

| 方法 | 参数 | 描述 |
|------|------|------|
| `uploadFiles` | `(files: File[])` | 上传多个文件 |
| `uploadSingleFile` | `(file: File)` | 上传单个文件 |

#### 高级用法

```javascript
// 拖拽上传
const handleDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  uploadFiles(files);
};

// 上传完成回调
useEffect(() => {
  if (!isUploading && uploadProgress === 100) {
    console.log('上传完成');
    // 刷新文件列表等操作
  }
}, [isUploading, uploadProgress]);
```

## 工具类 Hooks

### useDebounce

防抖 Hook，用于延迟执行频繁变化的值。

#### 基本用法

```javascript
import { useDebounce } from '@/hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

#### 参数说明

| 参数 | 类型 | 描述 |
|------|------|------|
| `value` | `any` | 需要防抖的值 |
| `delay` | `number` | 延迟时间（毫秒） |

### useLocalStorage

本地存储 Hook，提供持久化状态管理。

#### 基本用法

```javascript
import { useLocalStorage } from '@/hooks';

function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

#### 参数说明

| 参数 | 类型 | 描述 |
|------|------|------|
| `key` | `string` | 存储键名 |
| `initialValue` | `any` | 初始值 |

#### 返回值

返回一个数组 `[value, setValue]`，类似于 `useState`。

### useApi

API 请求 Hook，提供统一的请求处理和状态管理。

#### 基本用法

```javascript
import { useApi } from '@/hooks';

function DataComponent() {
  const { request, loading, error } = useApi();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const result = await request('/api/data', {
        method: 'GET'
      });
      setData(result);
    } catch (err) {
      console.error('请求失败:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

#### 返回值说明

| 属性 | 类型 | 描述 |
|------|------|------|
| `request` | `function` | 请求函数 |
| `loading` | `boolean` | 加载状态 |
| `error` | `string\|null` | 错误信息 |

## 管理面板 Hooks

### useAdminPanel

管理面板功能的 Hook，提供管理员相关操作。

#### 基本用法

```javascript
import { useAdminPanel } from '@/hooks';

function AdminPanel() {
  const {
    stats,
    loading,
    error,
    refreshStats,
    cleanupShortLinks,
    isAuthenticated
  } = useAdminPanel();

  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <h2>系统统计</h2>
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div>
          <p>文件总数: {stats.totalFiles}</p>
          <p>存储大小: {stats.totalSize}</p>
        </div>
      )}
      
      <button onClick={refreshStats}>刷新统计</button>
      <button onClick={cleanupShortLinks}>清理短链接</button>
    </div>
  );
}
```

## Context Hooks

### useApp

全局应用状态 Hook。

#### 基本用法

```javascript
import { useApp } from '@/components/context';

function App() {
  const {
    theme,
    language,
    user,
    settings,
    setTheme,
    setLanguage,
    updateSettings
  } = useApp();

  return (
    <div className={`app ${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </div>
  );
}
```

### useFileContext

文件管理上下文 Hook。

#### 基本用法

```javascript
import { useFileContext } from '@/components/context';

function FileManager() {
  const {
    files,
    selectedFiles,
    uploadProgress,
    isUploading,
    selectFile,
    uploadFiles
  } = useFileContext();

  // 使用文件上下文状态
}
```

### useNotification

通知系统 Hook。

#### 基本用法

```javascript
import { useNotification } from '@/components/context';

function Component() {
  const {
    showMessage,
    showConfirm,
    showModal,
    showToast,
    hideMessage
  } = useNotification();

  const handleAction = async () => {
    const confirmed = await showConfirm('确定要删除吗？');
    if (confirmed) {
      // 执行删除操作
      showToast('删除成功', 'success');
    }
  };

  return (
    <button onClick={handleAction}>删除</button>
  );
}
```

## 最佳实践

### 1. Hook 组合使用

```javascript
function FileManagementPage() {
  // 组合多个 Hooks
  const fileManager = useFileManager();
  const fileUpload = useFileUpload();
  const { showToast } = useNotification();

  // 上传完成后刷新列表
  useEffect(() => {
    if (!fileUpload.isUploading && fileUpload.uploadProgress === 100) {
      fileManager.refreshFiles();
      showToast('上传成功', 'success');
    }
  }, [fileUpload.isUploading, fileUpload.uploadProgress]);

  return (
    // JSX
  );
}
```

### 2. 错误处理

```javascript
function Component() {
  const { request, error } = useApi();

  const handleAction = async () => {
    try {
      await request('/api/action');
    } catch (err) {
      // Hook 会自动设置 error 状态
      console.error('操作失败:', err);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleAction}>执行操作</button>
    </div>
  );
}
```

### 3. 性能优化

```javascript
function OptimizedComponent() {
  const { files, searchFiles } = useFileManager();
  
  // 使用 useCallback 优化回调函数
  const handleSearch = useCallback((term) => {
    searchFiles(term);
  }, [searchFiles]);

  // 使用 useMemo 优化计算
  const fileCount = useMemo(() => files.length, [files]);

  return (
    // JSX
  );
}
```

## 常见问题

### Q: 如何在 Hook 中处理异步操作？

A: 使用 useEffect 和 async/await：

```javascript
function useAsyncData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
```

### Q: 如何避免 Hook 依赖循环？

A: 使用 useCallback 和 useMemo 优化依赖：

```javascript
function useOptimizedHook() {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((newValue) => {
    setState(prev => ({ ...prev, ...newValue }));
  }, []);

  const computedValue = useMemo(() => {
    return expensiveComputation(state);
  }, [state]);

  return { state, updateState, computedValue };
}
```

### Q: 如何在 Hook 中使用 Context？

A: 直接使用 useContext：

```javascript
function useCustomHook() {
  const context = useContext(MyContext);
  
  if (!context) {
    throw new Error('useCustomHook must be used within MyProvider');
  }

  return context;
}
```

这个指南涵盖了所有自定义 Hooks 的使用方法和最佳实践，帮助开发者更好地理解和使用项目中的 Hooks。