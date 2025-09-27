/**
 * 应用全局状态管理 Context
 * 提供应用级别的状态管理，包括主题、语言、用户设置等
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../../hooks';

// 创建 Context
const AppContext = createContext();

// 初始状态
const initialState = {
  theme: 'light',
  language: 'zh-CN',
  isLoading: false,
  error: null,
  user: null,
  settings: {
    autoRefresh: true,
    refreshInterval: 30000, // 30秒
    showPreview: true,
    gridView: true,
    sortBy: 'uploadTime',
    sortOrder: 'desc'
  }
};

// Action 类型
const ActionTypes = {
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer 函数
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };

    case ActionTypes.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
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
 * App Context Provider 组件
 * 提供全局状态管理功能
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 使用 localStorage 持久化设置
  const [storedSettings, setStoredSettings] = useLocalStorage('app-settings', initialState.settings);
  const [storedTheme, setStoredTheme] = useLocalStorage('app-theme', initialState.theme);
  const [storedLanguage, setStoredLanguage] = useLocalStorage('app-language', initialState.language);

  // 初始化时从 localStorage 恢复设置
  useEffect(() => {
    if (storedSettings) {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: storedSettings });
    }
    if (storedTheme) {
      dispatch({ type: ActionTypes.SET_THEME, payload: storedTheme });
    }
    if (storedLanguage) {
      dispatch({ type: ActionTypes.SET_LANGUAGE, payload: storedLanguage });
    }
  }, [storedSettings, storedTheme, storedLanguage]);

  // 主题切换时更新 localStorage 和 DOM
  useEffect(() => {
    setStoredTheme(state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme, setStoredTheme]);

  // 语言切换时更新 localStorage
  useEffect(() => {
    setStoredLanguage(state.language);
    document.documentElement.setAttribute('lang', state.language);
  }, [state.language, setStoredLanguage]);

  // 设置更新时保存到 localStorage
  useEffect(() => {
    setStoredSettings(state.settings);
  }, [state.settings, setStoredSettings]);

  // Action creators
  const actions = {
    /**
     * 设置主题
     * @param {string} theme - 主题名称 ('light' | 'dark')
     */
    setTheme: (theme) => {
      dispatch({ type: ActionTypes.SET_THEME, payload: theme });
    },

    /**
     * 切换主题
     */
    toggleTheme: () => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      dispatch({ type: ActionTypes.SET_THEME, payload: newTheme });
    },

    /**
     * 设置语言
     * @param {string} language - 语言代码
     */
    setLanguage: (language) => {
      dispatch({ type: ActionTypes.SET_LANGUAGE, payload: language });
    },

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoading: (isLoading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
    },

    /**
     * 设置错误信息
     * @param {string|Error} error - 错误信息
     */
    setError: (error) => {
      const errorMessage = error instanceof Error ? error.message : error;
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
    },

    /**
     * 清除错误信息
     */
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    /**
     * 设置用户信息
     * @param {Object} user - 用户信息
     */
    setUser: (user) => {
      dispatch({ type: ActionTypes.SET_USER, payload: user });
    },

    /**
     * 更新设置
     * @param {Object} settings - 要更新的设置
     */
    updateSettings: (settings) => {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
    },

    /**
     * 重置状态
     * @param {Object} newState - 新的状态（可选）
     */
    resetState: (newState = {}) => {
      dispatch({ type: ActionTypes.RESET_STATE, payload: newState });
    }
  };

  const contextValue = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * 使用 App Context 的 Hook
 * @returns {Object} App context 值和方法
 */
export function useApp() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}

// 导出 Action 类型供其他组件使用
export { ActionTypes };

// 默认导出
export default AppContext;