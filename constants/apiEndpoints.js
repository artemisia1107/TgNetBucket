/**
 * API端点配置
 * 统一管理所有API路径和端点
 */

/**
 * 基础API配置
 */
export const API_BASE = {
  URL: process.env.NEXT_PUBLIC_API_URL || '',
  VERSION: 'v1',
  TIMEOUT: 30000
};

/**
 * 文件相关API端点
 */
export const FILE_ENDPOINTS = {
  // 文件管理
  LIST: '/api/files',
  UPLOAD: '/api/files',
  DELETE: '/api/files',
  DOWNLOAD: '/api/download',
  
  // 文件信息
  INFO: (fileId) => `/api/files/${fileId}`,
  METADATA: (fileId) => `/api/files/${fileId}/metadata`,
  
  // 批量操作
  BATCH_DELETE: '/api/files/batch/delete',
  BATCH_DOWNLOAD: '/api/files/batch/download',
  BATCH_MOVE: '/api/files/batch/move',
  
  // 文件预览
  PREVIEW: (fileId) => `/api/files/${fileId}/preview`,
  THUMBNAIL: (fileId) => `/api/files/${fileId}/thumbnail`,
  
  // 文件分享
  SHARE: '/api/files/share',
  SHARE_INFO: (shareId) => `/api/share/${shareId}`,
  
  // 文件搜索
  SEARCH: '/api/files/search',
  RECENT: '/api/files/recent',
  FAVORITES: '/api/files/favorites'
};

/**
 * 短链接相关API端点
 */
export const SHORTLINK_ENDPOINTS = {
  CREATE: '/api/short-link',
  GET: (shortId) => `/api/short-link/${shortId}`,
  DELETE: (shortId) => `/api/short-link/${shortId}`,
  LIST: '/api/short-link/list',
  CLEANUP: '/api/cleanup-short-links',
  STATS: '/api/short-link/stats'
};

/**
 * 管理员相关API端点
 */
export const ADMIN_ENDPOINTS = {
  // 系统统计
  STATS: '/api/admin/stats',
  DASHBOARD: '/api/admin/dashboard',
  
  // 用户管理
  USERS: '/api/admin/users',
  USER_DETAIL: (userId) => `/api/admin/users/${userId}`,
  
  // 文件管理
  FILES: '/api/admin/files',
  FILE_DETAIL: (fileId) => `/api/admin/files/${fileId}`,
  
  // 系统设置
  SETTINGS: '/api/admin/settings',
  CONFIG: '/api/admin/config',
  
  // 日志管理
  LOGS: '/api/admin/logs',
  ERROR_LOGS: '/api/admin/logs/errors',
  ACCESS_LOGS: '/api/admin/logs/access',
  
  // 系统维护
  CLEANUP: '/api/admin/cleanup',
  BACKUP: '/api/admin/backup',
  RESTORE: '/api/admin/restore',
  
  // 监控
  HEALTH: '/api/admin/health',
  METRICS: '/api/admin/metrics'
};

/**
 * 用户相关API端点
 */
export const USER_ENDPOINTS = {
  // 认证
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  
  // 用户信息
  PROFILE: '/api/user/profile',
  UPDATE_PROFILE: '/api/user/profile',
  CHANGE_PASSWORD: '/api/user/password',
  
  // 用户设置
  SETTINGS: '/api/user/settings',
  PREFERENCES: '/api/user/preferences',
  
  // 用户文件
  MY_FILES: '/api/user/files',
  MY_UPLOADS: '/api/user/uploads',
  MY_SHARES: '/api/user/shares'
};

/**
 * 系统相关API端点
 */
export const SYSTEM_ENDPOINTS = {
  // 系统信息
  INFO: '/api/system/info',
  VERSION: '/api/system/version',
  STATUS: '/api/system/status',
  
  // 配置
  CONFIG: '/api/system/config',
  FEATURES: '/api/system/features',
  
  // 通知
  NOTIFICATIONS: '/api/notifications',
  MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`,
  
  // 反馈
  FEEDBACK: '/api/feedback',
  REPORT: '/api/report'
};

/**
 * 第三方服务API端点
 */
export const EXTERNAL_ENDPOINTS = {
  // Telegram
  TELEGRAM_WEBHOOK: '/api/telegram/webhook',
  TELEGRAM_STATUS: '/api/telegram/status',
  
  // 存储服务
  STORAGE_STATUS: '/api/storage/status',
  STORAGE_QUOTA: '/api/storage/quota',
  
  // CDN
  CDN_PURGE: '/api/cdn/purge',
  CDN_STATUS: '/api/cdn/status'
};

/**
 * WebSocket端点
 */
export const WS_ENDPOINTS = {
  UPLOAD_PROGRESS: '/ws/upload/progress',
  NOTIFICATIONS: '/ws/notifications',
  ADMIN_EVENTS: '/ws/admin/events',
  SYSTEM_STATUS: '/ws/system/status'
};

/**
 * 构建完整的API URL
 * @param {string} endpoint - API端点
 * @param {Object} params - URL参数
 * @returns {string} 完整的API URL
 */
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_BASE.URL}${endpoint}`;
  
  // 添加查询参数
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

/**
 * 获取文件下载URL
 * @param {string} fileId - 文件ID
 * @param {string} fileName - 文件名
 * @param {boolean} inline - 是否内联显示
 * @returns {string} 下载URL
 */
export const getDownloadUrl = (fileId, fileName, inline = false) => {
  return buildApiUrl(FILE_ENDPOINTS.DOWNLOAD, {
    fileId,
    fileName,
    inline: inline ? '1' : '0'
  });
};

/**
 * 获取文件预览URL
 * @param {string} fileId - 文件ID
 * @param {Object} options - 预览选项
 * @returns {string} 预览URL
 */
export const getPreviewUrl = (fileId, options = {}) => {
  const { width, height, quality = 80 } = options;
  return buildApiUrl(FILE_ENDPOINTS.PREVIEW(fileId), {
    width,
    height,
    quality
  });
};

/**
 * 获取缩略图URL
 * @param {string} fileId - 文件ID
 * @param {number} size - 缩略图尺寸
 * @returns {string} 缩略图URL
 */
export const getThumbnailUrl = (fileId, size = 200) => {
  return buildApiUrl(FILE_ENDPOINTS.THUMBNAIL(fileId), { size });
};

/**
 * 所有端点的统一导出
 */
export const API_ENDPOINTS = {
  ...FILE_ENDPOINTS,
  ...SHORTLINK_ENDPOINTS,
  ...ADMIN_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...SYSTEM_ENDPOINTS,
  ...EXTERNAL_ENDPOINTS,
  ...WS_ENDPOINTS
};

export default {
  API_BASE,
  FILE_ENDPOINTS,
  SHORTLINK_ENDPOINTS,
  ADMIN_ENDPOINTS,
  USER_ENDPOINTS,
  SYSTEM_ENDPOINTS,
  EXTERNAL_ENDPOINTS,
  WS_ENDPOINTS,
  API_ENDPOINTS,
  buildApiUrl,
  getDownloadUrl,
  getPreviewUrl,
  getThumbnailUrl
};