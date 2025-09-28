/**
 * 工具函数统一导出模块
 * 提供所有工具函数的统一入口
 */

// 文件工具
export * from './fileUtils.js';
export { default as FileUtils } from './fileUtils.js';

// 格式化工具
export * from './formatUtils.js';
export { default as FormatUtils } from './formatUtils.js';

// 通用工具
export * from './commonUtils.js';
export { default as CommonUtils } from './commonUtils.js';

// API工具
export * from './apiUtils.js';
export { default as ApiUtils } from './apiUtils.js';

// 验证工具
export * from './validationUtils.js';
export { default as ValidationUtils } from './validationUtils.js';

// 图标工具
export * from './iconUtils.js';
export { default as IconUtils } from './iconUtils.js';

// 常用工具函数的快捷导出
export { formatFileSize, getFileIcon } from './fileUtils.js';
export { formatDate, formatBytes } from './formatUtils.js';
export { copyToClipboard, debounce, throttle } from './commonUtils.js';
export { fileAPI, adminAPI } from './apiUtils.js';
export { validateFiles, validateFileType, validateFileSize } from './validationUtils.js';
export { getIconClass, createIcon, createIconProps } from './iconUtils.js';