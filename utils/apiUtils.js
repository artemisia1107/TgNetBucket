/**
 * API工具函数模块
 * 提供统一的API请求处理、错误处理和响应格式化功能
 */
import axios from 'axios';

/**
 * API响应状态码
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

/**
 * 创建axios实例
 */
const apiClient = axios.create({
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    const errorMessage = getErrorMessage(error);
    console.error('API请求失败:', errorMessage);
    return Promise.reject(error);
  }
);

/**
 * 获取错误信息
 * @param {Error} error - 错误对象
 * @returns {string} 错误信息
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response;
    if (data && data.error) {
      return data.error;
    }
    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return '未授权访问';
      case 403:
        return '禁止访问';
      case 404:
        return '资源不存在';
      case 500:
        return '服务器内部错误';
      default:
        return `请求失败 (${status})`;
    }
  } else if (error.request) {
    // 网络错误
    return '网络连接失败';
  } else {
    // 其他错误
    return error.message || '未知错误';
  }
};

/**
 * 文件API
 */
export const fileAPI = {
  /**
   * 获取文件列表
   * @param {Object} params - 查询参数
   * @returns {Promise} API响应
   */
  async getFiles(params = {}) {
    try {
      const response = await apiClient.get('/api/files', { params });
      return {
        success: true,
        data: response.data.files || [],
        total: response.data.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        data: []
      };
    }
  },

  /**
   * 上传文件
   * @param {File} file - 文件对象
   * @param {Function} onProgress - 进度回调
   * @returns {Promise} API响应
   */
  async uploadFile(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  },

  /**
   * 删除文件
   * @param {string} messageId - 消息ID
   * @returns {Promise} API响应
   */
  async deleteFile(messageId) {
    try {
      await apiClient.delete(`/api/files?messageId=${messageId}`);
      return {
        success: true,
        message: '文件删除成功'
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  },

  /**
   * 批量删除文件
   * @param {Array} messageIds - 消息ID数组
   * @returns {Promise} API响应
   */
  async batchDeleteFiles(messageIds) {
    try {
      const results = await Promise.allSettled(
        messageIds.map(id => this.deleteFile(id))
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failCount = results.length - successCount;

      return {
        success: successCount > 0,
        successCount,
        failCount,
        message: `成功删除 ${successCount} 个文件${failCount > 0 ? `，${failCount} 个失败` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  },

  /**
   * 生成短链接
   * @param {string} fileId - 文件ID
   * @returns {Promise} API响应
   */
  async generateShortLink(fileId) {
    try {
      const response = await apiClient.post('/api/short-link', { fileId });
      return {
        success: true,
        shortLink: response.data.shortLink
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  },

  /**
   * 获取下载链接
   * @param {string} fileId - 文件ID
   * @param {string} fileName - 文件名
   * @returns {string} 下载链接
   */
  getDownloadUrl(fileId, fileName) {
    return `/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`;
  }
};

/**
 * 管理员API
 */
export const adminAPI = {
  /**
   * 获取系统统计信息
   * @returns {Promise} API响应
   */
  async getStats() {
    try {
      const response = await apiClient.get('/api/admin/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  },

  /**
   * 清理过期短链接
   * @returns {Promise} API响应
   */
  async cleanupShortLinks() {
    try {
      const response = await apiClient.post('/api/cleanup-short-links');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
};

/**
 * 通用API请求方法
 * @param {string} method - HTTP方法
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} config - 请求配置
 * @returns {Promise} API响应
 */
export const request = async (method, url, data = null, config = {}) => {
  try {
    const response = await apiClient({
      method,
      url,
      data,
      ...config
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
};

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} params - 查询参数
 * @returns {Promise} API响应
 */
export const get = (url, params = {}) => {
  return request('GET', url, null, { params });
};

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {Promise} API响应
 */
export const post = (url, data = {}) => {
  return request('POST', url, data);
};

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {Promise} API响应
 */
export const put = (url, data = {}) => {
  return request('PUT', url, data);
};

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @returns {Promise} API响应
 */
export const del = (url) => {
  return request('DELETE', url);
};

export default {
  fileAPI,
  adminAPI,
  request,
  get,
  post,
  put,
  del,
  getErrorMessage,
  API_STATUS
};