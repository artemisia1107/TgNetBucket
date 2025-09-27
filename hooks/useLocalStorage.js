/**
 * 本地存储 Hook
 * 提供本地存储的状态管理
 */
import { useState, useCallback, useEffect } from 'react';

/**
 * 本地存储 Hook
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {Array} [value, setValue, removeValue]
 */
export function useLocalStorage(key, defaultValue = null) {
  // 从localStorage读取初始值
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`读取localStorage失败 (${key}):`, error);
      return defaultValue;
    }
  });

  /**
   * 设置值并同步到localStorage
   * @param {any} newValue - 新值或更新函数
   */
  const setStoredValue = useCallback((newValue) => {
    try {
      // 支持函数式更新
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`写入localStorage失败 (${key}):`, error);
    }
  }, [key, value]);

  /**
   * 移除存储的值
   */
  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`删除localStorage失败 (${key}):`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
}

/**
 * 会话存储 Hook
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {Array} [value, setValue, removeValue]
 */
export function useSessionStorage(key, defaultValue = null) {
  // 从sessionStorage读取初始值
  const [value, setValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`读取sessionStorage失败 (${key}):`, error);
      return defaultValue;
    }
  });

  /**
   * 设置值并同步到sessionStorage
   * @param {any} newValue - 新值或更新函数
   */
  const setStoredValue = useCallback((newValue) => {
    try {
      // 支持函数式更新
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      if (valueToStore === null || valueToStore === undefined) {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`写入sessionStorage失败 (${key}):`, error);
    }
  }, [key, value]);

  /**
   * 移除存储的值
   */
  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`删除sessionStorage失败 (${key}):`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
}

/**
 * 存储管理 Hook
 * 提供统一的存储管理接口
 */
export function useStorage() {
  /**
   * 获取存储值
   * @param {string} key - 存储键名
   * @param {string} type - 存储类型 ('local' | 'session')
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  const getItem = useCallback((key, type = 'local', defaultValue = null) => {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`读取${type}Storage失败 (${key}):`, error);
      return defaultValue;
    }
  }, []);

  /**
   * 设置存储值
   * @param {string} key - 存储键名
   * @param {any} value - 存储值
   * @param {string} type - 存储类型 ('local' | 'session')
   */
  const setItem = useCallback((key, value, type = 'local') => {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      if (value === null || value === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`写入${type}Storage失败 (${key}):`, error);
    }
  }, []);

  /**
   * 移除存储值
   * @param {string} key - 存储键名
   * @param {string} type - 存储类型 ('local' | 'session')
   */
  const removeItem = useCallback((key, type = 'local') => {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      storage.removeItem(key);
    } catch (error) {
      console.warn(`删除${type}Storage失败 (${key}):`, error);
    }
  }, []);

  /**
   * 清空存储
   * @param {string} type - 存储类型 ('local' | 'session')
   */
  const clear = useCallback((type = 'local') => {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      storage.clear();
    } catch (error) {
      console.warn(`清空${type}Storage失败:`, error);
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    clear
  };
}