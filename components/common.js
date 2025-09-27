/**
 * 公共组件库
 * 包含可复用的UI组件和工具函数
 */

/**
 * 创建消息提示组件
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'info')
 * @param {number} duration - 显示时长（毫秒）
 * @returns {HTMLElement} 消息元素
 */
function createMessage(message, type = 'info', duration = 3000) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  
  // 添加到页面
  document.body.appendChild(messageEl);
  
  // 触发显示动画
  requestAnimationFrame(() => {
    messageEl.classList.add('visible');
  });
  
  // 自动移除
  setTimeout(() => {
    messageEl.classList.remove('visible');
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, duration);
  
  return messageEl;
}

/**
 * 创建加载指示器
 * @param {string} text - 加载文本
 * @returns {HTMLElement} 加载元素
 */
function createLoader(text = '加载中...') {
  const loader = document.createElement('div');
  loader.className = 'loading';
  loader.innerHTML = `
    <div class="loading-spinner"></div>
    <span>${text}</span>
  `;
  return loader;
}

/**
 * 创建确认对话框
 * @param {string} message - 确认消息
 * @param {Function} onConfirm - 确认回调
 * @param {Function} onCancel - 取消回调
 * @returns {HTMLElement} 对话框元素
 */
function createConfirmDialog(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3 class="dialog-title">确认操作</h3>
      <p class="dialog-message">${message}</p>
      <div class="dialog-actions">
        <button class="btn btn-secondary dialog-cancel">取消</button>
        <button class="btn btn-primary dialog-confirm">确认</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // 绑定事件
  const cancelBtn = dialog.querySelector('.dialog-cancel');
  const confirmBtn = dialog.querySelector('.dialog-confirm');
  
  const closeDialog = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  };
  
  cancelBtn.addEventListener('click', () => {
    closeDialog();
    if (onCancel) onCancel();
  });
  
  confirmBtn.addEventListener('click', () => {
    closeDialog();
    if (onConfirm) onConfirm();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeDialog();
      if (onCancel) onCancel();
    }
  });
  
  // 显示对话框
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });
  
  return overlay;
}

/**
 * 创建进度条组件
 * @param {number} progress - 进度百分比 (0-100)
 * @param {string} text - 进度文本
 * @returns {HTMLElement} 进度条元素
 */
function createProgressBar(progress = 0, text = '') {
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  
  progressContainer.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${progress}%"></div>
    </div>
    <div class="progress-text">${text}</div>
  `;
  
  return progressContainer;
}

/**
 * 更新进度条
 * @param {HTMLElement} progressBar - 进度条元素
 * @param {number} progress - 进度百分比
 * @param {string} text - 进度文本
 */
function updateProgressBar(progressBar, progress, text = '') {
  const fill = progressBar.querySelector('.progress-fill');
  const textEl = progressBar.querySelector('.progress-text');
  
  if (fill) {
    fill.style.width = `${progress}%`;
  }
  
  if (textEl && text) {
    textEl.textContent = text;
  }
}

/**
 * 创建文件卡片组件
 * @param {Object} file - 文件信息
 * @returns {HTMLElement} 文件卡片元素
 */
function createFileCard(file) {
  const card = document.createElement('div');
  card.className = 'file-card';
  card.dataset.fileId = file.id;
  
  const fileIcon = getFileIcon(file.name);
  const fileSize = formatFileSize(file.size);
  const uploadDate = formatDate(file.uploadDate);
  
  card.innerHTML = `
    <div class="file-icon">${fileIcon}</div>
    <div class="file-info">
      <div class="file-name" title="${file.name}">${file.name}</div>
      <div class="file-meta">
        <span class="file-size">${fileSize}</span>
        <span class="file-date">${uploadDate}</span>
      </div>
    </div>
    <div class="file-actions">
      <button class="btn-icon copy-btn" title="复制链接" data-url="${file.url}">
        📋
      </button>
      <button class="btn-icon download-btn" title="下载" data-url="${file.url}">
        ⬇️
      </button>
      <button class="btn-icon delete-btn" title="删除" data-id="${file.id}">
        🗑️
      </button>
    </div>
  `;
  
  return card;
}

/**
 * 获取文件图标
 * @param {string} filename - 文件名
 * @returns {string} 图标字符
 */
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    // 图片
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️', 'svg': '🖼️',
    // 视频
    'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'wmv': '🎬', 'flv': '🎬', 'webm': '🎬',
    // 音频
    'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵', 'ogg': '🎵',
    // 文档
    'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📝', 'rtf': '📝',
    'xls': '📊', 'xlsx': '📊', 'csv': '📊',
    'ppt': '📊', 'pptx': '📊',
    // 压缩包
    'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦',
    // 代码
    'js': '💻', 'html': '💻', 'css': '💻', 'json': '💻', 'xml': '💻',
    'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️', 'php': '🐘',
    // 其他
    'exe': '⚙️', 'msi': '⚙️', 'dmg': '💿', 'iso': '💿'
  };
  
  return iconMap[ext] || '📄';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @returns {string} 格式化后的日期
 */
function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  }
  
  // 小于1天
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  }
  
  // 小于7天
  if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前';
  }
  
  // 超过7天显示具体日期
  return d.toLocaleDateString('zh-CN');
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 动画工具函数
 */
const AnimationUtils = {
  /**
   * 淡入动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 动画时长
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.opacity = Math.min(progress / duration, 1);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  },
  
  /**
   * 淡出动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 动画时长
   */
  fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.opacity = initialOpacity * (1 - progress / duration);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    requestAnimationFrame(animate);
  },
  
  /**
   * 滑入动画
   * @param {HTMLElement} element - 目标元素
   * @param {string} direction - 方向 ('up', 'down', 'left', 'right')
   * @param {number} duration - 动画时长
   */
  slideIn(element, direction = 'up', duration = 300) {
    const transforms = {
      up: 'translateY(20px)',
      down: 'translateY(-20px)',
      left: 'translateX(20px)',
      right: 'translateX(-20px)'
    };
    
    element.style.transform = transforms[direction];
    element.style.opacity = '0';
    element.style.display = 'block';
    
    requestAnimationFrame(() => {
      element.style.transition = `all ${duration}ms ease-out`;
      element.style.transform = 'translate(0)';
      element.style.opacity = '1';
    });
  }
};

// 导出所有函数（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createMessage,
    createLoader,
    createConfirmDialog,
    createProgressBar,
    updateProgressBar,
    createFileCard,
    getFileIcon,
    formatFileSize,
    formatDate,
    copyToClipboard,
    debounce,
    throttle,
    AnimationUtils
  };
}