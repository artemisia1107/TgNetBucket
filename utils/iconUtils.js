/**
 * 图标工具函数模块
 * 提供emoji到Font Awesome图标的映射功能
 */

/**
 * 获取Font Awesome图标类名
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
 * 通用图标映射
 * 将emoji图标映射到Font Awesome图标类名
 */
const iconMap = {
  // 文件和文件夹
  '📁': 'fas fa-folder',
  '📂': 'fas fa-folder-open',
  '📄': 'fas fa-file',
  '📋': 'fas fa-clipboard',
  '📦': 'fas fa-box',
  
  // 操作图标
  '🔍': 'fas fa-search',
  '⬆️': 'fas fa-upload',
  '⬇️': 'fas fa-download',
  '🗑️': 'fas fa-trash',
  '✓': 'fas fa-check',
  '❌': 'fas fa-times',
  '⚠️': 'fas fa-exclamation-triangle',
  '🔄': 'fas fa-sync',
  '⚙️': 'fas fa-cog',
  '🏠': 'fas fa-home',
  '☰': 'fas fa-bars',
  
  // 媒体文件
  '🖼️': 'fas fa-image',
  '🎥': 'fas fa-video',
  '🎵': 'fas fa-music',
  
  // 文档类型
  '📕': 'fas fa-file-pdf',
  '📘': 'fas fa-file-word',
  '📗': 'fas fa-file-excel',
  '📙': 'fas fa-file-powerpoint',
  '📝': 'fas fa-file-alt',
  
  // 技术图标
  '⚡': 'fab fa-js-square',
  '🌐': 'fab fa-html5',
  '🎨': 'fab fa-css3-alt',
  '💻': 'fas fa-code',
  '🔤': 'fas fa-font',
  
  // 状态图标
  '📊': 'fas fa-chart-bar',
  '🗄️': 'fas fa-database',
  '🔒': 'fas fa-lock',
  '❓': 'fas fa-question',
  '📧': 'fas fa-envelope',
  '🚀': 'fas fa-rocket'
};

/**
 * 获取Font Awesome图标类名
 * @param {string} emoji - emoji图标
 * @returns {string} Font Awesome图标类名
 */
function getIconClass(emoji) {
  return iconMap[emoji] || 'fas fa-question';
}

/**
 * 创建Font Awesome图标元素
 * @param {string} iconClass - Font Awesome图标类名
 * @param {string} additionalClasses - 额外的CSS类名
 * @returns {string} HTML字符串
 */
function createIcon(iconClass, additionalClasses = '') {
  return `<i class="${iconClass} ${additionalClasses}"></i>`;
}

/**
 * 创建React风格的图标组件属性
 * @param {string} iconClass - Font Awesome图标类名
 * @param {string} additionalClasses - 额外的CSS类名
 * @returns {object} React组件属性对象
 */
function createIconProps(iconClass, additionalClasses = '') {
  return {
    className: `${iconClass} ${additionalClasses}`.trim()
  };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getFileIcon,
    getIconClass,
    createIcon,
    createIconProps,
    iconMap
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境
  window.IconUtils = {
    getFileIcon,
    getIconClass,
    createIcon,
    createIconProps,
    iconMap
  };
  
  // 兼容性导出
  window.getFileIcon = getFileIcon;
  window.getIconClass = getIconClass;
}