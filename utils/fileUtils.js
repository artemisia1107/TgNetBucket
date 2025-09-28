/**
 * 文件工具函数模块
 * 提供文件处理、格式化、图标获取等功能
 */

/**
 * 获取文件图标 (Font Awesome版本)
 * @param {string} filename - 文件名
 * @returns {string} Font Awesome图标类名
 */
function getFileIcon(filename) {
  if (!filename) return 'fas fa-file';
  
  const ext = filename.toLowerCase().split('.').pop();
  
  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) {
    return 'fas fa-image';
  }
  
  // 视频文件
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext)) {
    return 'fas fa-video';
  }
  
  // 音频文件
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext)) {
    return 'fas fa-music';
  }
  
  // 文档文件
  if (['pdf'].includes(ext)) {
    return 'fas fa-file-pdf';
  }
  
  if (['doc', 'docx'].includes(ext)) {
    return 'fas fa-file-word';
  }
  
  if (['xls', 'xlsx'].includes(ext)) {
    return 'fas fa-file-excel';
  }
  
  if (['ppt', 'pptx'].includes(ext)) {
    return 'fas fa-file-powerpoint';
  }
  
  if (['txt', 'md', 'readme'].includes(ext)) {
    return 'fas fa-file-alt';
  }
  
  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return 'fas fa-file-archive';
  }
  
  // 代码文件
  if (['js', 'ts', 'jsx', 'tsx', 'vue', 'react'].includes(ext)) {
    return 'fab fa-js-square';
  }
  
  if (['html', 'htm', 'xml'].includes(ext)) {
    return 'fab fa-html5';
  }
  
  if (['css', 'scss', 'sass', 'less'].includes(ext)) {
    return 'fab fa-css3-alt';
  }
  
  if (['py'].includes(ext)) {
    return 'fab fa-python';
  }
  
  if (['java'].includes(ext)) {
    return 'fab fa-java';
  }
  
  if (['php'].includes(ext)) {
    return 'fab fa-php';
  }
  
  if (['cpp', 'c', 'cs', 'rb', 'go', 'rs'].includes(ext)) {
    return 'fas fa-code';
  }
  
  if (['json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'].includes(ext)) {
    return 'fas fa-cog';
  }
  
  // 可执行文件
  if (['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'appimage'].includes(ext)) {
    return 'fas fa-cogs';
  }
  
  // 字体文件
  if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) {
    return 'fas fa-font';
  }
  
  // 默认文件图标
  return 'fas fa-file';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 文件扩展名（小写）
 */
function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

/**
 * 获取文件名（不含扩展名）
 * @param {string} filename - 完整文件名
 * @returns {string} 不含扩展名的文件名
 */
function getFileNameWithoutExtension(filename) {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {Array<string>} allowedTypes - 允许的文件类型数组
 * @returns {boolean} 是否为允许的文件类型
 */
function validateFileType(file, allowedTypes) {
  if (!file || !allowedTypes || allowedTypes.length === 0) return true;
  
  const fileExtension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();
  
  return allowedTypes.some(type => {
    // 检查扩展名
    if (type.startsWith('.')) {
      return fileExtension === type.substring(1).toLowerCase();
    }
    // 检查MIME类型
    if (type.includes('/')) {
      return mimeType === type.toLowerCase() || mimeType.startsWith(type.toLowerCase());
    }
    // 检查通用类型
    return fileExtension === type.toLowerCase();
  });
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 是否在允许的大小范围内
 */
function validateFileSize(file, maxSize) {
  if (!file || !maxSize) return true;
  return file.size <= maxSize;
}

/**
 * 生成文件预览
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} 文件预览对象
 */
function generateFilePreview(file) {
  return new Promise((resolve) => {
    const preview = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name),
      icon: getFileIcon(file.name),
      formattedSize: formatFileSize(file.size),
      status: 'pending',
      progress: 0,
      url: null,
      thumbnail: null
    };
    
    // 为图片文件生成缩略图
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.thumbnail = e.target.result;
        resolve(preview);
      };
      reader.onerror = () => {
        resolve(preview);
      };
      reader.readAsDataURL(file);
    } else {
      resolve(preview);
    }
  });
}

/**
 * 批量生成文件预览
 * @param {FileList|Array<File>} files - 文件列表
 * @returns {Promise<Array<Object>>} 文件预览对象数组
 */
async function generateFilePreviews(files) {
  const fileArray = Array.from(files);
  const previews = await Promise.all(fileArray.map(generateFilePreview));
  return previews;
}

/**
 * 检查文件是否为图片
 * @param {File|string} file - 文件对象或文件名
 * @returns {boolean} 是否为图片文件
 */
function isImageFile(file) {
  if (file instanceof File) {
    return file.type.startsWith('image/');
  }
  if (typeof file === 'string') {
    const ext = getFileExtension(file);
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext);
  }
  return false;
}

/**
 * 检查文件是否为视频
 * @param {File|string} file - 文件对象或文件名
 * @returns {boolean} 是否为视频文件
 */
function isVideoFile(file) {
  if (file instanceof File) {
    return file.type.startsWith('video/');
  }
  if (typeof file === 'string') {
    const ext = getFileExtension(file);
    return ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext);
  }
  return false;
}

/**
 * 检查文件是否为音频
 * @param {File|string} file - 文件对象或文件名
 * @returns {boolean} 是否为音频文件
 */
function isAudioFile(file) {
  if (file instanceof File) {
    return file.type.startsWith('audio/');
  }
  if (typeof file === 'string') {
    const ext = getFileExtension(file);
    return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext);
  }
  return false;
}

/**
 * 创建文件下载链接
 * @param {Blob|File} file - 文件对象
 * @param {string} filename - 文件名
 * @returns {string} 下载链接
 */
function createDownloadLink(file, filename) {
  const url = URL.createObjectURL(file);
  return url;
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理URL对象
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getFileIcon,
    formatFileSize,
    getFileExtension,
    getFileNameWithoutExtension,
    validateFileType,
    validateFileSize,
    generateFilePreview,
    generateFilePreviews,
    isImageFile,
    isVideoFile,
    isAudioFile,
    createDownloadLink,
    downloadFile
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.FileUtils = {
    getFileIcon,
    formatFileSize,
    getFileExtension,
    getFileNameWithoutExtension,
    validateFileType,
    validateFileSize,
    generateFilePreview,
    generateFilePreviews,
    isImageFile,
    isVideoFile,
    isAudioFile,
    createDownloadLink,
    downloadFile
  };
  
  // 保持向后兼容
  window.getFileIcon = getFileIcon;
  window.formatFileSize = formatFileSize;
}