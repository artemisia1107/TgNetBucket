/**
 * 公共组件和工具函数
 * 这个文件包含了应用中常用的UI组件和工具函数
 */

// 导入工具函数
import { getFileIcon as newGetFileIcon, formatFileSize as newFormatFileSize } from '../utils/fileUtils.js';
import { formatDate as newFormatDate } from '../utils/formatUtils.js';

/**
 * 创建文件卡片
 * @param {Object} file - 文件对象
 * @returns {HTMLElement} 文件卡片元素
 */
function createFileCard(file) {
  const card = document.createElement('div');
  card.className = 'file-card';
  card.innerHTML = `
    <div class="file-icon">${newGetFileIcon(file.name)}</div>
    <div class="file-info">
      <div class="file-name" title="${file.name}">${file.name}</div>
      <div class="file-meta">
        <span class="file-size">${newFormatFileSize(file.size)}</span>
        <span class="file-date">${newFormatDate(file.uploadTime)}</span>
      </div>
    </div>
    <div class="file-actions">
      <button class="btn-icon" onclick="previewFile('${file.id}')" title="预览">
        👁️
      </button>
      <button class="btn-icon" onclick="downloadFile('${file.id}')" title="下载">
        📥
      </button>
      <button class="btn-icon" onclick="copyFileLink('${file.id}')" title="复制链接">
        🔗
      </button>
      <button class="btn-icon btn-danger" onclick="deleteFile('${file.id}')" title="删除">
        🗑️
      </button>
    </div>
  `;
  
  return card;
}

/**
 * 兼容性包装函数 - getFileIcon
 * @deprecated 请使用 utils/fileUtils.js 中的新函数
 */
// function getFileIcon(filename) {
//   console.warn('getFileIcon is deprecated. Please use the new fileUtils.');
//   return newGetFileIcon(filename);
// }

/**
 * 兼容性包装函数 - formatFileSize
 * @deprecated 请使用 utils/fileUtils.js 中的新函数
 */
// function formatFileSize(bytes) {
//   console.warn('formatFileSize is deprecated. Please use the new fileUtils.');
//   return newFormatFileSize(bytes);
// }

/**
 * 兼容性包装函数 - formatDate
 * @deprecated 请使用 utils/formatUtils.js 中的新函数
 */
// function formatDate(date) {
//   console.warn('formatDate is deprecated. Please use the new formatUtils.');
//   return newFormatDate(date);
// }

/**
 * 兼容性包装函数 - copyToClipboard
 * @deprecated 请使用 utils/commonUtils.js 中的新函数
 */
// async function copyToClipboard(text) {
//   console.warn('copyToClipboard is deprecated. Please use the new commonUtils.');
//   return newCopyToClipboard(text);
// }

/**
 * 兼容性包装函数 - debounce
 * @deprecated 请使用 utils/commonUtils.js 中的新函数
 */
// function debounce(func, wait) {
//   console.warn('debounce is deprecated. Please use the new commonUtils.');
//   return newDebounce(func, wait);
// }

/**
 * 兼容性包装函数 - throttle
 * @deprecated 请使用 utils/commonUtils.js 中的新函数
 */
// function throttle(func, limit) {
//   console.warn('throttle is deprecated. Please use the new commonUtils.');
//   // 注意：新的commonUtils中可能没有throttle，这里提供一个简单实现
//   let inThrottle;
//   return function(...args) {
//     if (!inThrottle) {
//       func.apply(this, args);
//       inThrottle = true;
//       setTimeout(() => inThrottle = false, limit);
//     }
//   };
// }

// 导出函数
export { createFileCard };