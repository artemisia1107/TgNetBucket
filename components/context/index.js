/**
 * Context 模块入口文件
 * 统一导出所有 Context Providers 和相关 Hooks
 */

// 导出 App Context
export { 
  AppProvider, 
  useApp, 
  ActionTypes as AppActionTypes 
} from './AppContext.js';

// 导出 File Context
export { 
  FileProvider, 
  useFileContext, 
  ActionTypes as FileActionTypes 
} from './FileContext.js';

// 导出 Notification Context
export { 
  NotificationProvider, 
  useNotification, 
  NotificationTypes,
  ActionTypes as NotificationActionTypes 
} from './NotificationContext.js';

// 导出默认的 Context 对象
export { default as AppContext } from './AppContext.js';
export { default as FileContext } from './FileContext.js';
export { default as NotificationContext } from './NotificationContext.js';

/**
 * 组合所有 Provider 的高阶组件
 * 提供完整的应用状态管理
 */
import React from 'react';
import { AppProvider, useApp } from './AppContext.js';
import { FileProvider, useFileContext } from './FileContext.js';
import { NotificationProvider, useNotification } from './NotificationContext.js';

/**
 * 全局状态提供者组件
 * 组合所有 Context Provider，为应用提供完整的状态管理
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {React.ReactElement} 包装后的组件
 */
export function GlobalProvider({ children }) {
  return (
    <AppProvider>
      <NotificationProvider>
        <FileProvider>
          {children}
        </FileProvider>
      </NotificationProvider>
    </AppProvider>
  );
}

/**
 * 组合多个 Context Hook 的自定义 Hook
 * 提供便捷的方式访问所有 Context
 * 
 * @returns {Object} 包含所有 Context 的对象
 */
export function useGlobalContext() {
  const app = useApp();
  const file = useFileContext();
  const notification = useNotification();
  
  return {
    app,
    file,
    notification
  };
}

// 默认导出 GlobalProvider
export default GlobalProvider;