/**
 * 验证工具函数模块
 * 提供各种数据验证功能
 */

/**
 * 文件类型配置
 */
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  VIDEO: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  CODE: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'yml']
};

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,    // 10MB
  VIDEO: 100 * 1024 * 1024,   // 100MB
  AUDIO: 50 * 1024 * 1024,    // 50MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
  ARCHIVE: 200 * 1024 * 1024, // 200MB
  CODE: 5 * 1024 * 1024,      // 5MB
  DEFAULT: 50 * 1024 * 1024   // 50MB
};

/**
 * 验证结果接口
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - 是否验证通过
 * @property {string} [error] - 错误信息
 * @property {string} [warning] - 警告信息
 */

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 文件扩展名（小写）
 */
export const getFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return '';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * 获取文件类型
 * @param {string} fileName - 文件名
 * @returns {string} 文件类型
 */
export const getFileType = (fileName) => {
  const ext = getFileExtension(fileName);
  
  for (const [type, extensions] of Object.entries(FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return type.toLowerCase();
    }
  }
  
  return 'other';
};

/**
 * 验证文件名
 * @param {string} fileName - 文件名
 * @returns {ValidationResult} 验证结果
 */
export const validateFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return { valid: false, error: '文件名不能为空' };
  }

  // 检查文件名长度
  if (fileName.length > 255) {
    return { valid: false, error: '文件名长度不能超过255个字符' };
  }

  // 检查非法字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(fileName)) {
    return { valid: false, error: '文件名包含非法字符' };
  }

  // 检查保留名称（Windows）
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(fileName)) {
    return { valid: false, error: '文件名不能使用系统保留名称' };
  }

  // 检查是否以点开头或结尾
  if (fileName.startsWith('.') || fileName.endsWith('.')) {
    return { valid: false, warning: '文件名不建议以点开头或结尾' };
  }

  return { valid: true };
};

/**
 * 验证文件类型
 * @param {File|string} file - 文件对象或文件名
 * @param {Array} allowedTypes - 允许的文件类型数组
 * @returns {ValidationResult} 验证结果
 */
export const validateFileType = (file, allowedTypes = []) => {
  const fileName = typeof file === 'string' ? file : file.name;
  const ext = getFileExtension(fileName);

  if (!ext) {
    return { valid: false, error: '文件必须有扩展名' };
  }

  if (allowedTypes.length === 0) {
    return { valid: true };
  }

  // 支持扩展名和MIME类型验证
  const isAllowed = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return ext === type.substring(1);
    }
    if (type.includes('/')) {
      // MIME类型验证
      return file.type && file.type.startsWith(type);
    }
    return ext === type.toLowerCase();
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: `不支持的文件类型: ${ext}。允许的类型: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} [maxSize] - 最大文件大小（字节）
 * @returns {ValidationResult} 验证结果
 */
export const validateFileSize = (file, maxSize) => {
  if (!file || !file.size) {
    return { valid: false, error: '无法获取文件大小' };
  }

  // 如果没有指定最大大小，根据文件类型自动判断
  if (!maxSize) {
    const fileType = getFileType(file.name);
    maxSize = FILE_SIZE_LIMITS[fileType.toUpperCase()] || FILE_SIZE_LIMITS.DEFAULT;
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100;
    return {
      valid: false,
      error: `文件大小 ${fileSizeMB}MB 超过限制 ${maxSizeMB}MB`
    };
  }

  // 检查文件是否为空
  if (file.size === 0) {
    return { valid: false, error: '文件不能为空' };
  }

  return { valid: true };
};

/**
 * 验证文件完整性（基本检查）
 * @param {File} file - 文件对象
 * @returns {ValidationResult} 验证结果
 */
export const validateFileIntegrity = (file) => {
  if (!file) {
    return { valid: false, error: '文件对象无效' };
  }

  // 检查必要属性
  if (!file.name) {
    return { valid: false, error: '文件名缺失' };
  }

  if (file.size === undefined || file.size === null) {
    return { valid: false, error: '文件大小信息缺失' };
  }

  if (!file.type && !getFileExtension(file.name)) {
    return { valid: false, error: '无法确定文件类型' };
  }

  return { valid: true };
};

/**
 * 批量验证文件
 * @param {FileList|Array} files - 文件列表
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateFiles = (files, options = {}) => {
  const {
    maxFiles = 10,
    allowedTypes = [],
    maxSize,
    maxTotalSize = 500 * 1024 * 1024 // 500MB
  } = options;

  const results = {
    valid: true,
    errors: [],
    warnings: [],
    validFiles: [],
    invalidFiles: []
  };

  // 检查文件数量
  if (files.length > maxFiles) {
    results.valid = false;
    results.errors.push(`文件数量 ${files.length} 超过限制 ${maxFiles}`);
    return results;
  }

  let totalSize = 0;

  // 逐个验证文件
  Array.from(files).forEach((file, index) => {
    const fileResults = {
      file,
      index,
      errors: [],
      warnings: []
    };

    // 文件完整性验证
    const integrityResult = validateFileIntegrity(file);
    if (!integrityResult.valid) {
      fileResults.errors.push(integrityResult.error);
    }

    // 文件名验证
    const nameResult = validateFileName(file.name);
    if (!nameResult.valid) {
      fileResults.errors.push(nameResult.error);
    } else if (nameResult.warning) {
      fileResults.warnings.push(nameResult.warning);
    }

    // 文件类型验证
    if (allowedTypes.length > 0) {
      const typeResult = validateFileType(file, allowedTypes);
      if (!typeResult.valid) {
        fileResults.errors.push(typeResult.error);
      }
    }

    // 文件大小验证
    const sizeResult = validateFileSize(file, maxSize);
    if (!sizeResult.valid) {
      fileResults.errors.push(sizeResult.error);
    }

    totalSize += file.size;

    // 收集结果
    if (fileResults.errors.length > 0) {
      results.invalidFiles.push(fileResults);
      results.errors.push(`文件 "${file.name}": ${fileResults.errors.join(', ')}`);
    } else {
      results.validFiles.push(fileResults);
    }

    if (fileResults.warnings.length > 0) {
      results.warnings.push(`文件 "${file.name}": ${fileResults.warnings.join(', ')}`);
    }
  });

  // 检查总大小
  if (totalSize > maxTotalSize) {
    results.valid = false;
    const totalSizeMB = Math.round(totalSize / 1024 / 1024);
    const maxTotalSizeMB = Math.round(maxTotalSize / 1024 / 1024);
    results.errors.push(`总文件大小 ${totalSizeMB}MB 超过限制 ${maxTotalSizeMB}MB`);
  }

  // 最终验证结果
  results.valid = results.errors.length === 0;

  return results;
};

/**
 * 验证URL
 * @param {string} url - URL字符串
 * @returns {ValidationResult} 验证结果
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL不能为空' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL格式无效' };
  }
};

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {ValidationResult} 验证结果
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: '邮箱地址不能为空' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱地址格式无效' };
  }

  return { valid: true };
};

export default {
  FILE_TYPES,
  FILE_SIZE_LIMITS,
  getFileExtension,
  getFileType,
  validateFileName,
  validateFileType,
  validateFileSize,
  validateFileIntegrity,
  validateFiles,
  validateUrl,
  validateEmail
};