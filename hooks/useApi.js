/**
 * API 请求 Hook
 * 提供通用的API请求状态管理
 */
import { useState, useCallback } from 'react';
import axios from 'axios';
import { createErrorMessage } from '../components/ui/Message';

/**
 * API 请求 Hook
 * @param {Object} options - 配置选项
 * @returns {Object} API状态和方法
 */
export function useApi(options = {}) {
  const {
    showErrorMessage = true,
    defaultErrorMessage = 'API请求失败'
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * 执行API请求
   * @param {Function} apiCall - API调用函数
   * @param {Object} options - 请求选项
   * @returns {Promise<any>} 请求结果
   */
  const execute = useCallback(async (apiCall, requestOptions = {}) => {
    const {
      onSuccess,
      onError,
      showError = showErrorMessage,
      errorMessage = defaultErrorMessage
    } = requestOptions;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorObj = {
        message: err.response?.data?.error || err.message || errorMessage,
        status: err.response?.status,
        data: err.response?.data
      };
      
      setError(errorObj);
      
      if (showError) {
        createErrorMessage(errorObj.message);
      }
      
      if (onError) {
        onError(errorObj);
      }
      
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [showErrorMessage, defaultErrorMessage]);

  /**
   * GET 请求
   * @param {string} url - 请求URL
   * @param {Object} config - axios配置
   * @param {Object} options - 请求选项
   * @returns {Promise<any>} 请求结果
   */
  const get = useCallback((url, config = {}, options = {}) => {
    return execute(() => axios.get(url, config), options);
  }, [execute]);

  /**
   * POST 请求
   * @param {string} url - 请求URL
   * @param {any} data - 请求数据
   * @param {Object} config - axios配置
   * @param {Object} options - 请求选项
   * @returns {Promise<any>} 请求结果
   */
  const post = useCallback((url, data = {}, config = {}, options = {}) => {
    return execute(() => axios.post(url, data, config), options);
  }, [execute]);

  /**
   * PUT 请求
   * @param {string} url - 请求URL
   * @param {any} data - 请求数据
   * @param {Object} config - axios配置
   * @param {Object} options - 请求选项
   * @returns {Promise<any>} 请求结果
   */
  const put = useCallback((url, data = {}, config = {}, options = {}) => {
    return execute(() => axios.put(url, data, config), options);
  }, [execute]);

  /**
   * DELETE 请求
   * @param {string} url - 请求URL
   * @param {Object} config - axios配置
   * @param {Object} options - 请求选项
   * @returns {Promise<any>} 请求结果
   */
  const del = useCallback((url, config = {}, options = {}) => {
    return execute(() => axios.delete(url, config), options);
  }, [execute]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    // 状态
    loading,
    error,
    data,
    
    // 方法
    execute,
    get,
    post,
    put,
    delete: del,
    reset,
    
    // 计算属性
    hasError: !!error,
    hasData: !!data,
    isIdle: !loading && !error && !data,
  };
}

/**
 * 简化的API Hook，用于单次请求
 * @param {Function} apiCall - API调用函数
 * @param {Object} options - 配置选项
 * @returns {Object} API状态和方法
 */
export function useApiCall(apiCall, options = {}) {
  const api = useApi(options);
  
  const call = useCallback((requestOptions = {}) => {
    return api.execute(apiCall, requestOptions);
  }, [api, apiCall]);

  return {
    ...api,
    call
  };
}