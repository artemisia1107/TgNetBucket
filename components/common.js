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
    <div class="file-icon"><i class="${newGetFileIcon(file.name)}"></i></div>
    <div class="file-info">
      <div class="file-name" title="${file.name}">${file.name}</div>
      <div class="file-meta">
        <span class="file-size">${newFormatFileSize(file.size)}</span>
        <span class="file-date">${newFormatDate(file.uploadTime)}</span>
      </div>
    </div>
    <div class="file-actions">
      <button class="btn-icon" onclick="previewFile('${file.id}')" title="预览">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon" onclick="downloadFile('${file.id}')" title="下载">
        <i class="fas fa-download"></i>
      </button>
      <button class="btn-icon" onclick="copyFileLink('${file.id}')" title="复制链接">
        <i class="fas fa-link"></i>
      </button>
      <button class="btn-icon btn-danger" onclick="deleteFile('${file.id}')" title="删除">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  return card;
}



// 导入React组件
import FileCard from './ui/FileCard';

// 导出函数和组件
export { createFileCard, FileCard };