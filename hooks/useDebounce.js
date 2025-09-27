/**
 * 防抖和节流 Hook
 * 提供防抖和节流功能
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 防抖 Hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {any} 防抖后的值
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Array} deps - 依赖数组
 * @returns {Function} 防抖后的回调函数
 */
export function useDebouncedCallback(callback, delay, deps = []) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * 节流 Hook
 * @param {any} value - 需要节流的值
 * @param {number} limit - 限制时间（毫秒）
 * @returns {any} 节流后的值
 */
export function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * 节流回调 Hook
 * @param {Function} callback - 回调函数
 * @param {number} limit - 限制时间（毫秒）
 * @param {Array} deps - 依赖数组
 * @returns {Function} 节流后的回调函数
 */
export function useThrottledCallback(callback, limit, deps = []) {
  const lastRan = useRef(Date.now());

  const throttledCallback = useCallback((...args) => {
    if (Date.now() - lastRan.current >= limit) {
      callback(...args);
      lastRan.current = Date.now();
    }
  }, [callback, limit, ...deps]);

  return throttledCallback;
}

/**
 * 搜索防抖 Hook
 * 专门用于搜索输入的防抖处理
 * @param {string} searchTerm - 搜索词
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Object} 搜索状态和方法
 */
export function useSearchDebounce(searchTerm, delay = 300) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return {
    debouncedSearchTerm,
    isSearching,
    hasSearchTerm: debouncedSearchTerm.trim().length > 0
  };
}

/**
 * 输入防抖 Hook
 * 用于表单输入的防抖处理
 * @param {any} initialValue - 初始值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Object} 输入状态和方法
 */
export function useInputDebounce(initialValue = '', delay = 300) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsPending(true);
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, debouncedValue]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
    setIsPending(false);
  }, [initialValue]);

  return {
    value,
    debouncedValue,
    isPending,
    setValue,
    reset,
    hasValue: value.toString().trim().length > 0,
    hasDebouncedValue: debouncedValue.toString().trim().length > 0
  };
}