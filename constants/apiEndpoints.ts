/**
 * API端点配置
 * 统一管理所有API路径和端点
 * 
 * @author TgNetBucket Team
 * @since 2025-09-29
 */

/**
 * 基础API配置接口
 */
export interface APIBase {
  URL: string;
  VERSION: string;
  TIMEOUT: number;
}

/**
 * 文件端点接口
 */
export interface FileEndpoints {
  LIST: string;
  UPLOAD: string;
  DELETE: string;
  DOWNLOAD: string;
  INFO: (fileId: string) => string;
  METADATA: (fileId: string) => string;
  BATCH_DELETE: string;
  BATCH_DOWNLOAD: string;
  BATCH_MOVE: string;
  PREVIEW: (fileId: string) => string;
  THUMBNAIL: (fileId: string) => string;
  SHARE: string;
  SHARE_INFO: (shareId: string) => string;
  SEARCH: string;
  RECENT: string;
  FAVORITES: string;
}

/**
 * 基础API配置
 * 定义API的基础URL、版本和超时时间
 */
export const API_BASE: APIBase = {
  URL: process.env.NEXT_PUBLIC_API_URL || '',
  VERSION: 'v1',
  TIMEOUT: 30000
};

/**
 * 文件相关API端点
 * 定义所有文件操作相关的API路径
 */
export const FILE_ENDPOINTS: FileEndpoints = {
  // 文件管理
  LIST: '/api/files',
  UPLOAD: '/api/files',
  DELETE: '/api/files',
  DOWNLOAD: '/api/download',
  
  // 文件信息
  INFO: (fileId: string) => `/api/files/${fileId}`,
  METADATA: (fileId: string) => `/api/files/${fileId}/metadata`,
  
  // 批量操作
  BATCH_DELETE: '/api/files/batch/delete',
  BATCH_DOWNLOAD: '/api/files/batch/download',
  BATCH_MOVE: '/api/files/batch/move',
  
  // 文件预览
  PREVIEW: (fileId: string) => `/api/files/${fileId}/preview`,
  THUMBNAIL: (fileId: string) => `/api/files/${fileId}/thumbnail`,
  
  // 文件分享
  SHARE: '/api/files/share',
  SHARE_INFO: (shareId: string) => `/api/share/${shareId}`,
  
  // 文件搜索
  SEARCH: '/api/files/search',
  RECENT: '/api/files/recent',
  FAVORITES: '/api/files/favorites'
};

/**
 * 短链接端点接口
 */
export interface ShortlinkEndpoints {
  CREATE: string;
  GET: (shortId: string) => string;
  DELETE: (shortId: string) => string;
  LIST: string;
  CLEANUP: string;
  STATS: string;
}

/**
 * 短链接相关API端点
 * 定义短链接创建、获取、删除等操作的API路径
 */
export const SHORTLINK_ENDPOINTS: ShortlinkEndpoints = {
  CREATE: '/api/short-link',
  GET: (shortId) => `/api/short-link/${shortId}`,
  DELETE: (shortId) => `/api/short-link/${shortId}`,
  LIST: '/api/short-link/list',
  CLEANUP: '/api/cleanup-short-links',
  STATS: '/api/short-link/stats'
};

/**
 * 管理员端点接口
 */
export interface AdminEndpoints {
  STATS: string;
  DASHBOARD: string;
  USERS: string;
  USER_DETAIL: (userId: string) => string;
  FILES: string;
  FILE_DETAIL: (fileId: string) => string;
  SETTINGS: string;
  CONFIG: string;
  LOGS: string;
  ERROR_LOGS: string;
  ACCESS_LOGS: string;
  CLEANUP: string;
  BACKUP: string;
  RESTORE: string;
  HEALTH: string;
  METRICS: string;
}

/**
 * 管理员相关API端点
 * 定义管理员功能相关的API路径
 */
export const ADMIN_ENDPOINTS: AdminEndpoints = {
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
  MARK_READ: (notificationId: string) => `/api/notifications/${notificationId}/read`,
  
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
 * 将API端点和查询参数组合成完整的URL
 * 
 * @param endpoint - API端点路径
 * @param params - URL查询参数对象
 * @returns 完整的API URL字符串
 * 
 * @example
 * ```typescript
 * const url = buildApiUrl('/api/files', { page: 1, limit: 10 });
 * // 返回: '/api/files?page=1&limit=10'
 * ```
 */
export const buildApiUrl = (
  endpoint: string, 
  params: Record<string, string | number | boolean | null | undefined> = {}
): string => {
  let url = `${API_BASE.URL}${endpoint}`;
  
  // 添加查询参数
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
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
 * 根据文件ID和文件名生成下载链接
 * 
 * @param fileId - 文件唯一标识符
 * @param fileName - 文件名称
 * @param inline - 是否内联显示（true为预览，false为下载）
 * @returns 文件下载URL
 * 
 * @example
 * ```typescript
 * const downloadUrl = getDownloadUrl('123', 'document.pdf', false);
 * const previewUrl = getDownloadUrl('123', 'image.jpg', true);
 * ```
 */
export const getDownloadUrl = (
  fileId: string, 
  fileName: string, 
  inline: boolean = false
): string => {
  return buildApiUrl(FILE_ENDPOINTS.DOWNLOAD, {
    fileId,
    fileName,
    inline: inline ? '1' : '0'
  });
};

/**
 * 获取文件预览URL
 * 根据文件ID生成预览链接，支持不同尺寸
 * 
 * @param fileId - 文件唯一标识符
 * @param size - 预览尺寸（small、medium、large）
 * @returns 文件预览URL
 * 
 * @example
 * ```typescript
 * const previewUrl = getPreviewUrl('123', 'large');
 * ```
 */
export const getPreviewUrl = (
  fileId: string, 
  size: 'small' | 'medium' | 'large' = 'medium'
): string => {
  return buildApiUrl(FILE_ENDPOINTS.PREVIEW(fileId), { size });
};

/**
 * 获取文件缩略图URL
 * 根据文件ID生成缩略图链接，用于快速预览
 * 
 * @param fileId - 文件唯一标识符
 * @param size - 缩略图尺寸（small、medium、large）
 * @returns 文件缩略图URL
 * 
 * @example
 * ```typescript
 * const thumbnailUrl = getThumbnailUrl('123', 'small');
 * ```
 */
export const getThumbnailUrl = (
  fileId: string, 
  size: 'small' | 'medium' | 'large' = 'small'
): string => {
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