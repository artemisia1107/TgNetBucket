/**
 * 应用配置常量
 * 统一管理应用中的配置项和常量
 */

/**
 * 文件相关配置
 */
const FILE_CONFIG = {
  // 文件大小限制
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_TOTAL_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
  
  // 文件类型配置
  ALLOWED_TYPES: [
    // 图片
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // 文档
    'application/pdf', 'text/plain', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // 压缩文件
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // 音频
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    // 视频
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
    // 代码文件
    'text/javascript', 'text/css', 'text/html', 'application/json',
    'text/xml', 'application/xml'
  ],

  // 预览相关配置
  MAX_PREVIEW_SIZE: 10 * 1024 * 1024, // 10MB
  PREVIEW_TYPES: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'text/plain', 'application/json', 'text/javascript', 'text/css', 'text/html'
  ],
  
  // 文件扩展名映射
  EXTENSION_MAP: {
    // 图片
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    // 文档
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // 压缩文件
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    // 音频
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    // 视频
    'mp4': 'video/mp4',
    'avi': 'video/avi',
    'mov': 'video/mov',
    'wmv': 'video/wmv',
    'flv': 'video/flv',
    'webm': 'video/webm',
    // 代码文件
    'js': 'text/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'xml': 'application/xml'
  },
  
  // 文件图标映射 (Font Awesome类名)
  ICON_MAP: {
    // 图片
    'image': 'fas fa-image',
    'jpg': 'fas fa-image', 'jpeg': 'fas fa-image', 'png': 'fas fa-image', 'gif': 'fas fa-image', 'webp': 'fas fa-image', 'svg': 'fas fa-image',
    // 文档
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word', 'docx': 'fas fa-file-word',
    'xls': 'fas fa-file-excel', 'xlsx': 'fas fa-file-excel',
    'ppt': 'fas fa-file-powerpoint', 'pptx': 'fas fa-file-powerpoint',
    'txt': 'fas fa-file-alt',
    // 压缩文件
    'zip': 'fas fa-file-archive', 'rar': 'fas fa-file-archive', '7z': 'fas fa-file-archive',
    // 音频
    'audio': 'fas fa-file-audio',
    'mp3': 'fas fa-file-audio', 'wav': 'fas fa-file-audio', 'ogg': 'fas fa-file-audio', 'm4a': 'fas fa-file-audio',
    // 视频
    'video': 'fas fa-file-video',
    'mp4': 'fas fa-file-video', 'avi': 'fas fa-file-video', 'mov': 'fas fa-file-video', 'wmv': 'fas fa-file-video', 'flv': 'fas fa-file-video', 'webm': 'fas fa-file-video',
    // 代码文件
    'js': 'fas fa-file-code', 'css': 'fas fa-file-code', 'html': 'fas fa-file-code', 'json': 'fas fa-file-code', 'xml': 'fas fa-file-code',
    // 默认
    'default': 'fas fa-file'
  }
};

/**
 * UI相关配置
 */
const UI_CONFIG = {
  // 动画时长
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // Z-index层级
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    TOAST: 1100,
    TOOLTIP: 1150,
    OVERLAY: 1200
  },
  
  // 颜色主题
  COLORS: {
    PRIMARY: '#007bff',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    DANGER: '#dc3545',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40'
  },
  
  // 断点
  BREAKPOINTS: {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1400
  },
  
  // 消息提示配置
  MESSAGE: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      WARNING: 4000,
      INFO: 3000
    },
    MAX_COUNT: 5
  }
};

/**
 * API相关配置
 */
const API_CONFIG = {
  // 请求超时时间
  TIMEOUT: 30000,
  
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_FACTOR: 2
  },
  
  // 状态码
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    TIMEOUT_ERROR: '请求超时，请稍后重试',
    SERVER_ERROR: '服务器错误，请稍后重试',
    UNAUTHORIZED: '未授权访问，请重新登录',
    FORBIDDEN: '权限不足，无法执行此操作',
    NOT_FOUND: '请求的资源不存在',
    VALIDATION_ERROR: '数据验证失败',
    UNKNOWN_ERROR: '未知错误，请稍后重试'
  }
};

/**
 * 存储相关配置
 */
const STORAGE_CONFIG = {
  // 本地存储键名
  KEYS: {
    USER_PREFERENCES: 'user_preferences',
    UPLOAD_QUEUE: 'upload_queue',
    FILE_CACHE: 'file_cache',
    SETTINGS: 'app_settings',
    THEME: 'app_theme'
  },
  
  // 缓存过期时间
  EXPIRY: {
    SHORT: 5 * 60 * 1000,      // 5分钟
    MEDIUM: 30 * 60 * 1000,    // 30分钟
    LONG: 24 * 60 * 60 * 1000, // 24小时
    WEEK: 7 * 24 * 60 * 60 * 1000 // 7天
  }
};

/**
 * 上传相关配置
 */
const UPLOAD_CONFIG = {
  // 分片上传配置
  CHUNK_SIZE: 1024 * 1024, // 1MB
  MAX_CONCURRENT: 3,       // 最大并发数
  
  // 上传状态
  STATUS: {
    PENDING: 'pending',
    UPLOADING: 'uploading',
    SUCCESS: 'success',
    ERROR: 'error',
    CANCELLED: 'cancelled'
  },
  
  // 上传类型
  TYPES: {
    SINGLE: 'single',
    BATCH: 'batch',
    DRAG_DROP: 'drag_drop'
  }
};

/**
 * 验证规则配置
 */
const VALIDATION_RULES = {
  // 文件名验证
  FILENAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    INVALID_CHARS: /[<>:"/\\|?*]/g,
    RESERVED_NAMES: ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  },
  
  // URL验证
  URL: {
    PATTERN: /^https?:\/\/.+/,
    MAX_LENGTH: 2048
  },
  
  // 密码验证
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SYMBOLS: false
  }
};

/**
 * 认证配置
 */
const AUTH_CONFIG = {
  // 认证方式
  METHODS: {
    LOCAL: 'local',
    REDIS: 'redis'
  },
  
  // 会话配置
  SESSION: {
    DURATION: 24 * 60 * 60 * 1000, // 24小时
    COOKIE_NAME: 'tg_net_bucket_auth',
    STORAGE_KEY: 'auth_session'
  },
  
  // 认证状态
  STATUS: {
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    EXPIRED: 'expired'
  },
  
  // 错误消息
  ERRORS: {
    INVALID_CREDENTIALS: '用户名或密码错误',
    SESSION_EXPIRED: '会话已过期，请重新登录',
    ACCESS_DENIED: '访问被拒绝，需要管理员权限',
    AUTH_REQUIRED: '需要认证后才能执行此操作'
  }
};

/**
 * 事件名称常量
 */
const EVENTS = {
  // 文件相关事件
  FILE_UPLOAD_START: 'file:upload:start',
  FILE_UPLOAD_PROGRESS: 'file:upload:progress',
  FILE_UPLOAD_SUCCESS: 'file:upload:success',
  FILE_UPLOAD_ERROR: 'file:upload:error',
  FILE_DELETE: 'file:delete',
  FILE_DOWNLOAD: 'file:download',
  
  // UI相关事件
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  MESSAGE_SHOW: 'message:show',
  MESSAGE_HIDE: 'message:hide',
  
  // 应用相关事件
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  THEME_CHANGE: 'theme:change'
};

/**
 * 正则表达式常量
 */
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^1[3-9]\d{9}$/,
  FILENAME: /^[^<>:"/\\|?*]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
};

/**
 * 默认设置
 */
const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'zh-CN',
  autoSave: true,
  showPreview: true,
  enableNotifications: true,
  maxConcurrentUploads: 3,
  chunkSize: 1024 * 1024,
  autoCleanup: false
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FILE_CONFIG,
    UI_CONFIG,
    API_CONFIG,
    STORAGE_CONFIG,
    UPLOAD_CONFIG,
    VALIDATION_RULES,
    AUTH_CONFIG,
    EVENTS,
    REGEX,
    DEFAULT_SETTINGS
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.AppConfig = {
    FILE_CONFIG,
    UI_CONFIG,
    API_CONFIG,
    STORAGE_CONFIG,
    UPLOAD_CONFIG,
    VALIDATION_RULES,
    AUTH_CONFIG,
    EVENTS,
    REGEX,
    DEFAULT_SETTINGS
  };
}