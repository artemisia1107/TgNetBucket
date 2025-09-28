/**
 * 文件类型配置
 * 定义各种文件类型、扩展名、MIME类型和相关配置
 */

/**
 * 文件类型分类
 */
export const FILE_CATEGORIES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  ARCHIVE: 'archive',
  CODE: 'code',
  FONT: 'font',
  OTHER: 'other'
};

/**
 * 文件扩展名映射
 */
export const FILE_EXTENSIONS = {
  [FILE_CATEGORIES.IMAGE]: [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif',
    'heic', 'heif', 'avif', 'jfif', 'pjpeg', 'pjp'
  ],
  [FILE_CATEGORIES.VIDEO]: [
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg',
    '3gp', 'ogv', 'ts', 'mts', 'm2ts', 'vob', 'rm', 'rmvb', 'asf'
  ],
  [FILE_CATEGORIES.AUDIO]: [
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'ape', 'ac3',
    'dts', 'ra', 'au', 'aiff', 'amr', 'awb'
  ],
  [FILE_CATEGORIES.DOCUMENT]: [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt',
    'ods', 'odp', 'pages', 'numbers', 'key', 'epub', 'mobi', 'azw', 'azw3'
  ],
  [FILE_CATEGORIES.ARCHIVE]: [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'lzma', 'cab', 'iso',
    'dmg', 'pkg', 'deb', 'rpm', 'msi', 'exe'
  ],
  [FILE_CATEGORIES.CODE]: [
    'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less',
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'py', 'java',
    'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
    'scala', 'clj', 'hs', 'elm', 'dart', 'lua', 'perl', 'sh', 'bash', 'zsh',
    'fish', 'ps1', 'bat', 'cmd', 'sql', 'r', 'matlab', 'm', 'vue', 'svelte'
  ],
  [FILE_CATEGORIES.FONT]: [
    'ttf', 'otf', 'woff', 'woff2', 'eot', 'fon', 'fnt'
  ]
};

/**
 * MIME类型映射
 */
export const MIME_TYPES = {
  // 图片
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'ico': 'image/x-icon',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'heic': 'image/heic',
  'heif': 'image/heif',
  'avif': 'image/avif',
  
  // 视频
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',
  'flv': 'video/x-flv',
  'webm': 'video/webm',
  'm4v': 'video/x-m4v',
  'mpg': 'video/mpeg',
  'mpeg': 'video/mpeg',
  '3gp': 'video/3gpp',
  'ogv': 'video/ogg',
  
  // 音频
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'flac': 'audio/flac',
  'aac': 'audio/aac',
  'ogg': 'audio/ogg',
  'wma': 'audio/x-ms-wma',
  'm4a': 'audio/mp4',
  'opus': 'audio/opus',
  'ape': 'audio/x-ape',
  
  // 文档
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  
  // 压缩文件
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  'bz2': 'application/x-bzip2',
  
  // 代码文件
  'js': 'text/javascript',
  'ts': 'text/typescript',
  'jsx': 'text/jsx',
  'tsx': 'text/tsx',
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'scss': 'text/scss',
  'sass': 'text/sass',
  'less': 'text/less',
  'json': 'application/json',
  'xml': 'application/xml',
  'yaml': 'text/yaml',
  'yml': 'text/yaml',
  'py': 'text/x-python',
  'java': 'text/x-java-source',
  'c': 'text/x-c',
  'cpp': 'text/x-c++',
  'cs': 'text/x-csharp',
  'php': 'text/x-php',
  'rb': 'text/x-ruby',
  'go': 'text/x-go',
  'rs': 'text/x-rust',
  'swift': 'text/x-swift',
  'sql': 'text/x-sql',
  
  // 字体
  'ttf': 'font/ttf',
  'otf': 'font/otf',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'eot': 'application/vnd.ms-fontobject'
};

/**
 * 文件图标映射
 */
export const FILE_ICONS = {
  // 分类图标
  [FILE_CATEGORIES.IMAGE]: '🖼️',
  [FILE_CATEGORIES.VIDEO]: '🎬',
  [FILE_CATEGORIES.AUDIO]: '🎵',
  [FILE_CATEGORIES.DOCUMENT]: '📄',
  [FILE_CATEGORIES.ARCHIVE]: '🗜️',
  [FILE_CATEGORIES.CODE]: '💻',
  [FILE_CATEGORIES.FONT]: '🔤',
  [FILE_CATEGORIES.OTHER]: '📁',
  
  // 具体文件类型图标
  'pdf': '📕',
  'doc': '📘', 'docx': '📘',
  'xls': '📗', 'xlsx': '📗',
  'ppt': '📙', 'pptx': '📙',
  'txt': '📝',
  'md': '📝',
  'json': '📋',
  'xml': '📋',
  'html': '🌐',
  'css': '🎨',
  'js': '📜',
  'ts': '📜',
  'py': '🐍',
  'java': '☕',
  'php': '🐘',
  'rb': '💎',
  'go': '🐹',
  'rs': '🦀',
  'swift': '🦉',
  'zip': '🗜️',
  'rar': '🗜️',
  '7z': '🗜️',
  'exe': '⚙️',
  'dmg': '💿',
  'iso': '💿'
};

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  [FILE_CATEGORIES.IMAGE]: 20 * 1024 * 1024,    // 20MB
  [FILE_CATEGORIES.VIDEO]: 500 * 1024 * 1024,   // 500MB
  [FILE_CATEGORIES.AUDIO]: 100 * 1024 * 1024,   // 100MB
  [FILE_CATEGORIES.DOCUMENT]: 50 * 1024 * 1024, // 50MB
  [FILE_CATEGORIES.ARCHIVE]: 200 * 1024 * 1024, // 200MB
  [FILE_CATEGORIES.CODE]: 10 * 1024 * 1024,     // 10MB
  [FILE_CATEGORIES.FONT]: 5 * 1024 * 1024,      // 5MB
  [FILE_CATEGORIES.OTHER]: 100 * 1024 * 1024    // 100MB
};

/**
 * 可预览的文件类型
 */
export const PREVIEWABLE_TYPES = {
  [FILE_CATEGORIES.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
  [FILE_CATEGORIES.VIDEO]: ['mp4', 'webm', 'ogg'],
  [FILE_CATEGORIES.AUDIO]: ['mp3', 'wav', 'ogg', 'm4a'],
  [FILE_CATEGORIES.DOCUMENT]: ['pdf', 'txt'],
  [FILE_CATEGORIES.CODE]: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'md', 'py', 'java', 'c', 'cpp']
};

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
 * 获取文件类型分类
 * @param {string} fileName - 文件名
 * @returns {string} 文件类型分类
 */
export const getFileCategory = (fileName) => {
  const ext = getFileExtension(fileName);
  
  for (const [category, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return FILE_CATEGORIES.OTHER;
};

/**
 * 获取文件MIME类型
 * @param {string} fileName - 文件名
 * @returns {string} MIME类型
 */
export const getFileMimeType = (fileName) => {
  const ext = getFileExtension(fileName);
  return MIME_TYPES[ext] || 'application/octet-stream';
};

/**
 * 获取文件图标
 * @param {string} fileName - 文件名
 * @returns {string} 文件图标
 */
export const getFileIcon = (fileName) => {
  const ext = getFileExtension(fileName);
  
  // 优先使用具体扩展名的图标
  if (FILE_ICONS[ext]) {
    return FILE_ICONS[ext];
  }
  
  // 使用分类图标
  const category = getFileCategory(fileName);
  return FILE_ICONS[category] || FILE_ICONS[FILE_CATEGORIES.OTHER];
};

/**
 * 检查文件是否可预览
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否可预览
 */
export const isPreviewable = (fileName) => {
  const ext = getFileExtension(fileName);
  const category = getFileCategory(fileName);
  
  return PREVIEWABLE_TYPES[category]?.includes(ext) || false;
};

/**
 * 获取文件大小限制
 * @param {string} fileName - 文件名
 * @returns {number} 文件大小限制（字节）
 */
export const getFileSizeLimit = (fileName) => {
  const category = getFileCategory(fileName);
  return FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS[FILE_CATEGORIES.OTHER];
};

/**
 * 检查文件类型是否被允许
 * @param {string} fileName - 文件名
 * @param {Array} allowedTypes - 允许的文件类型数组
 * @returns {boolean} 是否被允许
 */
export const isFileTypeAllowed = (fileName, allowedTypes = []) => {
  if (allowedTypes.length === 0) return true;
  
  const ext = getFileExtension(fileName);
  const category = getFileCategory(fileName);
  const mimeType = getFileMimeType(fileName);
  
  return allowedTypes.some(type => {
    // 检查扩展名
    if (type.startsWith('.')) {
      return ext === type.substring(1);
    }
    // 检查MIME类型
    if (type.includes('/')) {
      return mimeType === type || mimeType.startsWith(`${type.split('/')[0]}/`);
    }
    // 检查分类
    return category === type || ext === type;
  });
};

export default {
  FILE_CATEGORIES,
  FILE_EXTENSIONS,
  MIME_TYPES,
  FILE_ICONS,
  FILE_SIZE_LIMITS,
  PREVIEWABLE_TYPES,
  getFileExtension,
  getFileCategory,
  getFileMimeType,
  getFileIcon,
  isPreviewable,
  getFileSizeLimit,
  isFileTypeAllowed
};