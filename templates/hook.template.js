/**
 * React Hook 模板
 * 用于生成标准化的自定义 Hook
 */

const hookTemplate = `import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook 配置选项接口
 */
interface {{hookName}}Options {
  /** 是否启用 Hook */
  enabled?: boolean;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 成功回调函数 */
  onSuccess?: (data: any) => void;
  /** 错误回调函数 */
  onError?: (error: Error) => void;
  /** 其他配置选项 */
  [key: string]: any;
}

/**
 * Hook 返回值接口
 */
interface {{hookName}}Return<T = any> {
  /** 数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 执行函数 */
  execute: (...args: any[]) => Promise<T | void>;
  /** 重置函数 */
  reset: () => void;
}

/**
 * {{hookName}} Hook
 * {{description}}
 * 
 * @author {{author}}
 * @since {{date}}
 */
const {{hookName}} = <T = any>({
  enabled = true,
  delay = 0,
  onSuccess,
  onError,
  ...options
}: {{hookName}}Options = {}): {{hookName}}Return<T> => {
  // 状态管理
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 引用管理
  const mountedRef = useRef<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函数
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // 重置函数
  const reset = useCallback(() => {
    if (!mountedRef.current) return;
    
    cleanup();
    setData(null);
    setError(null);
    setLoading(false);
  }, [cleanup]);

  // 执行函数
  const execute = useCallback(async (...args) => {
    if (!mountedRef.current || !enabled) return;

    // 清理之前的请求
    cleanup();

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);

      // 延迟执行
      if (delay > 0) {
        await new Promise((resolve) => {
          timeoutRef.current = setTimeout(resolve, delay);
        });
      }

      // 检查是否已取消
      if (signal.aborted || !mountedRef.current) return;

      // 执行主要逻辑
      const result = await performOperation(...args, { signal, ...options });

      // 检查是否已取消
      if (signal.aborted || !mountedRef.current) return;

      setData(result);
      onSuccess?.(result);

    } catch (err) {
      // 忽略取消错误
      if (err.name === 'AbortError' || !mountedRef.current) return;

      console.error('{{hookName}} Error:', err);
      setError(err);
      onError?.(err);

    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, delay, onSuccess, onError, cleanup, options]);

  // 自动执行（如果启用）
  useEffect(() => {
    if (enabled && options.autoExecute) {
      execute();
    }
  }, [enabled, execute, options.autoExecute]);

  // 清理副作用
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    // 额外的状态
    isIdle: !loading && !error && !data,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
  };
};

/**
 * 执行主要操作的函数
 * 这里需要根据具体的 Hook 功能来实现
 */
async function performOperation(...args) {
  // TODO: 实现具体的操作逻辑
  // 例如：API 调用、数据处理、异步计算等
  
  // 示例：模拟异步操作
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.8) {
        reject(new Error('Random error occurred'));
      } else {
        resolve({ message: 'Operation completed successfully', args });
      }
    }, 1000);
  });
}

export default {{hookName}};
`;

const hookTestTemplate = `import { renderHook, act } from '@testing-library/react';
import {{hookName}} from './{{hookName}}';

/**
 * {{hookName}} Hook 测试
 * 
 * @author {{author}}
 * @since {{date}}
 */
describe('{{hookName}}', () => {
  // 基础功能测试
  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => {{hookName}}());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  // 执行功能测试
  test('should execute operation successfully', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => 
      {{hookName}}({ onSuccess })
    );

    await act(async () => {
      await result.current.execute('test-arg');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
    expect(result.current.isSuccess).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(result.current.data);
  });

  // 错误处理测试
  test('should handle errors correctly', async () => {
    const onError = jest.fn();
    
    // 模拟错误情况
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    
    const { result } = renderHook(() => 
      {{hookName}}({ onError })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(true);
    expect(onError).toHaveBeenCalledWith(result.current.error);

    // 恢复 Math.random
    Math.random.mockRestore();
  });

  // 加载状态测试
  test('should show loading state during execution', async () => {
    const { result } = renderHook(() => {{hookName}}());

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isIdle).toBe(false);

    // 等待执行完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.loading).toBe(false);
  });

  // 重置功能测试
  test('should reset state correctly', async () => {
    const { result } = renderHook(() => {{hookName}}());

    // 先执行操作
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeDefined();

    // 重置状态
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isIdle).toBe(true);
  });

  // 禁用状态测试
  test('should not execute when disabled', async () => {
    const { result } = renderHook(() => 
      {{hookName}}({ enabled: false })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  // 延迟执行测试
  test('should respect delay option', async () => {
    const delay = 500;
    const { result } = renderHook(() => 
      {{hookName}}({ delay })
    );

    const startTime = Date.now();

    await act(async () => {
      await result.current.execute();
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    expect(executionTime).toBeGreaterThanOrEqual(delay);
  });

  // 自动执行测试
  test('should auto-execute when enabled', async () => {
    const onSuccess = jest.fn();
    
    renderHook(() => 
      {{hookName}}({ 
        autoExecute: true, 
        onSuccess 
      })
    );

    // 等待自动执行完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  // 取消操作测试
  test('should cancel operation when component unmounts', async () => {
    const { result, unmount } = renderHook(() => {{hookName}}());

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    // 卸载组件
    unmount();

    // 等待一段时间确保操作被取消
    await new Promise(resolve => setTimeout(resolve, 1100));

    // 由于组件已卸载，无法检查状态
    // 但确保没有内存泄漏或错误
  });

  // 并发执行测试
  test('should handle concurrent executions correctly', async () => {
    const { result } = renderHook(() => {{hookName}}());

    // 启动多个并发执行
    const promises = [
      act(async () => await result.current.execute('arg1')),
      act(async () => await result.current.execute('arg2')),
      act(async () => await result.current.execute('arg3'))
    ];

    await Promise.all(promises);

    // 应该只有最后一个执行的结果
    expect(result.current.data).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
`;

const hookDocTemplate = `# {{hookName}} Hook

{{description}}

## 使用方法

\`\`\`javascript
import {{hookName}} from './hooks/{{hookName}}';

function MyComponent() {
  const {
    data,
    loading,
    error,
    execute,
    reset,
    isIdle,
    isSuccess,
    isError
  } = {{hookName}}({
    enabled: true,
    delay: 0,
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  });

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      
      <button onClick={() => execute('param1', 'param2')}>
        Execute
      </button>
      <button onClick={reset}>
        Reset
      </button>
    </div>
  );
}
\`\`\`

## API

### 参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| \`enabled\` | \`boolean\` | \`true\` | 是否启用 Hook |
| \`delay\` | \`number\` | \`0\` | 执行延迟时间（毫秒） |
| \`onSuccess\` | \`function\` | \`undefined\` | 成功回调函数 |
| \`onError\` | \`function\` | \`undefined\` | 错误回调函数 |
| \`autoExecute\` | \`boolean\` | \`false\` | 是否自动执行 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| \`data\` | \`any\` | 执行结果数据 |
| \`loading\` | \`boolean\` | 是否正在加载 |
| \`error\` | \`Error \\| null\` | 错误信息 |
| \`execute\` | \`function\` | 执行函数 |
| \`reset\` | \`function\` | 重置状态函数 |
| \`isIdle\` | \`boolean\` | 是否处于空闲状态 |
| \`isSuccess\` | \`boolean\` | 是否执行成功 |
| \`isError\` | \`boolean\` | 是否有错误 |

## 特性

- ✅ 自动状态管理
- ✅ 错误处理
- ✅ 加载状态
- ✅ 取消支持
- ✅ 延迟执行
- ✅ 自动执行
- ✅ TypeScript 支持
- ✅ 内存泄漏防护

## 示例

### 基础用法

\`\`\`javascript
const { data, loading, execute } = {{hookName}}();

// 手动执行
execute('parameter');
\`\`\`

### 自动执行

\`\`\`javascript
const { data, loading } = {{hookName}}({
  autoExecute: true
});
\`\`\`

### 错误处理

\`\`\`javascript
const { error, execute } = {{hookName}}({
  onError: (error) => {
    console.error('Operation failed:', error);
  }
});
\`\`\`

### 延迟执行

\`\`\`javascript
const { execute } = {{hookName}}({
  delay: 1000 // 延迟 1 秒执行
});
\`\`\`

## 注意事项

1. Hook 会自动处理组件卸载时的清理工作
2. 并发执行时，只有最后一个执行会生效
3. 使用 \`enabled\` 参数可以条件性地启用/禁用 Hook
4. 错误会被自动捕获并设置到 \`error\` 状态中

## 作者

{{author}}

## 许可证

MIT
`;

module.exports = {
  hookTemplate,
  hookTestTemplate,
  hookDocTemplate
};