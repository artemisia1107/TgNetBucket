/**
 * MIME类型映射工具
 * 根据文件扩展名返回对应的MIME类型
 */

const mimeTypes = {
  // 文档类型
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'txt': 'text/plain',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  
  // 图片类型
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'svg': 'image/svg+xml',
  'webp': 'image/webp',
  'ico': 'image/x-icon',
  'raw': 'image/x-canon-cr2',
  
  // 音频类型
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'flac': 'audio/flac',
  'aac': 'audio/aac',
  'ogg': 'audio/ogg',
  'm4a': 'audio/mp4',
  'wma': 'audio/x-ms-wma',
  'aiff': 'audio/aiff',
  
  // 视频类型
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',
  'flv': 'video/x-flv',
  'webm': 'video/webm',
  '3gp': 'video/3gpp',
  'm4v': 'video/x-m4v',
  
  // 压缩文件
  'zip': 'application/zip',
  'rar': 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  'bz2': 'application/x-bzip2',
  'xz': 'application/x-xz',
  
  // 程序文件
  'exe': 'application/vnd.microsoft.portable-executable',
  'msi': 'application/x-msi',
  'dmg': 'application/x-apple-diskimage',
  'deb': 'application/vnd.debian.binary-package',
  'rpm': 'application/x-rpm',
  'apk': 'application/vnd.android.package-archive',
  'ipa': 'application/octet-stream',
  
  // 代码文件
  'js': 'text/javascript',
  'py': 'text/x-python',
  'java': 'text/x-java-source',
  'cpp': 'text/x-c++src',
  'c': 'text/x-csrc',
  'h': 'text/x-chdr',
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'json': 'application/json',
  'xml': 'application/xml',
  'yaml': 'text/yaml',
  'yml': 'text/yaml',
  'md': 'text/markdown',
  'php': 'text/x-php',
  'rb': 'text/x-ruby',
  'go': 'text/x-go',
  'rs': 'text/x-rust',
  'ts': 'text/typescript',
  'jsx': 'text/jsx',
  'tsx': 'text/tsx',
  
  // 数据文件
  'csv': 'text/csv',
  'sql': 'application/sql',
  'db': 'application/x-sqlite3',
  'sqlite': 'application/x-sqlite3',
  'sqlite3': 'application/x-sqlite3',
  'log': 'text/plain',
  
  // 其他常见类型
  'bin': 'application/octet-stream',
  'iso': 'application/x-iso9660-image',
  'img': 'application/octet-stream',
  'torrent': 'application/x-bittorrent'
};

/**
 * 根据文件名获取MIME类型
 * @param {string} fileName - 文件名
 * @returns {string} MIME类型
 */
function getMimeType(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return 'application/octet-stream';
  }
  
  // 获取文件扩展名
  const extension = fileName.toLowerCase().split('.').pop();
  
  // 返回对应的MIME类型，如果找不到则返回默认类型
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * 检查文件是否为图片类型
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为图片
 */
function isImageFile(fileName) {
  const mimeType = getMimeType(fileName);
  return mimeType.startsWith('image/');
}

/**
 * 检查文件是否为视频类型
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为视频
 */
function isVideoFile(fileName) {
  const mimeType = getMimeType(fileName);
  return mimeType.startsWith('video/');
}

/**
 * 检查文件是否为音频类型
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为音频
 */
function isAudioFile(fileName) {
  const mimeType = getMimeType(fileName);
  return mimeType.startsWith('audio/');
}

/**
 * 生成安全的文件名用于下载
 * @param {string} fileName - 原始文件名
 * @returns {string} 安全的文件名
 */
function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return 'download';
  }
  
  // 移除或替换不安全的字符
  let safeName = fileName
    .replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // 移除控制字符（扩展范围）
    .replace(/[\r\n\t]/g, '') // 移除换行符和制表符
    .replace(/['"]/g, '') // 移除引号
    .replace(/[;,]/g, '_') // 替换分号和逗号
    .trim();
  
  // 如果文件名为空或只包含点，使用默认名称
  if (!safeName || safeName === '.' || safeName === '..') {
    safeName = 'download';
  }
  
  // 限制长度并确保有扩展名
  safeName = safeName.substring(0, 200);
  
  // 如果没有扩展名，添加默认扩展名
  if (!safeName.includes('.')) {
    safeName += '.bin';
  }
  
  return safeName;
}

/**
 * 为 Content-Disposition 头部生成安全的文件名
 * @param {string} fileName - 原始文件名
 * @returns {string} 格式化的 Content-Disposition 值
 */
function createContentDisposition(fileName) {
  const safeName = sanitizeFileName(fileName);
  
  // 使用 ASCII 安全的文件名作为 filename
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, '_');
  
  // 使用 RFC 5987 编码的文件名作为 filename*
  const encodedName = encodeURIComponent(safeName);
  
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

export {
  getMimeType,
  isImageFile,
  isVideoFile,
  isAudioFile,
  sanitizeFileName,
  createContentDisposition,
  mimeTypes
};