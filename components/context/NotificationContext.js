/**
 * 通知系统全局状态 Context
 * 提供全局消息、通知、模态框等UI状态管理
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  createSuccessMessage, 
  createErrorMessage, 
  createWarningMessage, 
  createMessage,
  clearAllMessages 
} from '../ui/Message.js';
import { 
  createConfirmDialog, 
  createModal, 
  createLoadingModal 
} from '../ui/Modal.js';

// 创建 Context
const NotificationContext = createContext();

// 通知类型
const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// 初始状态
const initialState = {
  notifications: [],
  modals: [],
  toasts: [],
  isLoading: false,
  loadingMessage: '',
  confirmDialog: null
};

// Action 类型
const ActionTypes = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  ADD_MODAL: 'ADD_MODAL',
  REMOVE_MODAL: 'REMOVE_MODAL',
  CLEAR_MODALS: 'CLEAR_MODALS',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS',
  SET_LOADING: 'SET_LOADING',
  SET_CONFIRM_DIALOG: 'SET_CONFIRM_DIALOG',
  CLEAR_CONFIRM_DIALOG: 'CLEAR_CONFIRM_DIALOG',
  RESET_STATE: 'RESET_STATE'
};

// Reducer 函数
function notificationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload)
      };

    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    case ActionTypes.ADD_MODAL:
      return {
        ...state,
        modals: [...state.modals, action.payload]
      };

    case ActionTypes.REMOVE_MODAL:
      return {
        ...state,
        modals: state.modals.filter(modal => modal.id !== action.payload)
      };

    case ActionTypes.CLEAR_MODALS:
      return {
        ...state,
        modals: []
      };

    case ActionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };

    case ActionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };

    case ActionTypes.CLEAR_TOASTS:
      return {
        ...state,
        toasts: []
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || ''
      };

    case ActionTypes.SET_CONFIRM_DIALOG:
      return {
        ...state,
        confirmDialog: action.payload
      };

    case ActionTypes.CLEAR_CONFIRM_DIALOG:
      return {
        ...state,
        confirmDialog: null
      };

    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        ...action.payload
      };

    default:
      return state;
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Notification Context Provider 组件
 * 提供全局通知和消息管理
 */
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Action creators
  const actions = {
    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     * @param {Object} options - 选项
     */
    showSuccess: useCallback((message, options = {}) => {
      const notification = {
        id: generateId(),
        type: NotificationTypes.SUCCESS,
        message,
        timestamp: Date.now(),
        ...options
      };
      
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
      
      // 同时使用现有的消息组件
      createSuccessMessage(message);
      
      // 自动移除
      if (options.autoRemove !== false) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id });
        }, options.duration || 5000);
      }
      
      return notification.id;
    }, []),

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     * @param {Object} options - 选项
     */
    showError: useCallback((message, options = {}) => {
      const notification = {
        id: generateId(),
        type: NotificationTypes.ERROR,
        message,
        timestamp: Date.now(),
        ...options
      };
      
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
      
      // 同时使用现有的消息组件
      createErrorMessage(message);
      
      // 错误消息默认不自动移除
      if (options.autoRemove === true) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id });
        }, options.duration || 8000);
      }
      
      return notification.id;
    }, []),

    /**
     * 显示警告消息
     * @param {string} message - 消息内容
     * @param {Object} options - 选项
     */
    showWarning: useCallback((message, options = {}) => {
      const notification = {
        id: generateId(),
        type: NotificationTypes.WARNING,
        message,
        timestamp: Date.now(),
        ...options
      };
      
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
      
      // 同时使用现有的消息组件
      createWarningMessage(message);
      
      // 自动移除
      if (options.autoRemove !== false) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id });
        }, options.duration || 6000);
      }
      
      return notification.id;
    }, []),

    /**
     * 显示信息消息
     * @param {string} message - 消息内容
     * @param {Object} options - 选项
     */
    showInfo: useCallback((message, options = {}) => {
      const notification = {
        id: generateId(),
        type: NotificationTypes.INFO,
        message,
        timestamp: Date.now(),
        ...options
      };
      
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
      
      // 同时使用现有的消息组件
      createMessage(message, 'info');
      
      // 自动移除
      if (options.autoRemove !== false) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id });
        }, options.duration || 4000);
      }
      
      return notification.id;
    }, []),

    /**
     * 移除通知
     * @param {string} id - 通知ID
     */
    removeNotification: useCallback((id) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    }, []),

    /**
     * 清除所有通知
     */
    clearNotifications: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
      clearAllMessages();
    }, []),

    /**
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     * @param {Object} options - 选项
     */
    showConfirm: useCallback((message, onConfirm, onCancel, options = {}) => {
      const dialog = {
        id: generateId(),
        message,
        onConfirm,
        onCancel,
        ...options
      };
      
      dispatch({ type: ActionTypes.SET_CONFIRM_DIALOG, payload: dialog });
      
      // 同时使用现有的确认对话框组件
      createConfirmDialog(message, onConfirm, onCancel);
      
      return dialog.id;
    }, []),

    /**
     * 关闭确认对话框
     */
    closeConfirm: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_CONFIRM_DIALOG });
    }, []),

    /**
     * 显示模态框
     * @param {Object} modalConfig - 模态框配置
     */
    showModal: useCallback((modalConfig) => {
      const modal = {
        id: generateId(),
        ...modalConfig,
        timestamp: Date.now()
      };
      
      dispatch({ type: ActionTypes.ADD_MODAL, payload: modal });
      
      // 同时使用现有的模态框组件
      createModal(modalConfig);
      
      return modal.id;
    }, []),

    /**
     * 关闭模态框
     * @param {string} id - 模态框ID
     */
    closeModal: useCallback((id) => {
      dispatch({ type: ActionTypes.REMOVE_MODAL, payload: id });
    }, []),

    /**
     * 显示加载状态
     * @param {boolean} isLoading - 是否加载中
     * @param {string} message - 加载消息
     */
    setLoading: useCallback((isLoading, message = '') => {
      dispatch({ 
        type: ActionTypes.SET_LOADING, 
        payload: { isLoading, message } 
      });
      
      // 同时使用现有的加载模态框组件
      if (isLoading && message) {
        createLoadingModal(message);
      }
    }, []),

    /**
     * 显示Toast消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     * @param {Object} options - 选项
     */
    showToast: useCallback((message, type = NotificationTypes.INFO, options = {}) => {
      const toast = {
        id: generateId(),
        message,
        type,
        timestamp: Date.now(),
        ...options
      };
      
      dispatch({ type: ActionTypes.ADD_TOAST, payload: toast });
      
      // 自动移除
      if (options.autoRemove !== false) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_TOAST, payload: toast.id });
        }, options.duration || 3000);
      }
      
      return toast.id;
    }, []),

    /**
     * 移除Toast
     * @param {string} id - Toast ID
     */
    removeToast: useCallback((id) => {
      dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id });
    }, []),

    /**
     * 重置状态
     * @param {Object} newState - 新的状态（可选）
     */
    resetState: useCallback((newState = {}) => {
      dispatch({ type: ActionTypes.RESET_STATE, payload: newState });
    }, [])
  };

  const contextValue = {
    ...state,
    ...actions
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * 使用 Notification Context 的 Hook
 * @returns {Object} Notification context 值和方法
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

// 导出通知类型和 Action 类型
export { NotificationTypes, ActionTypes };

// 默认导出
export default NotificationContext;