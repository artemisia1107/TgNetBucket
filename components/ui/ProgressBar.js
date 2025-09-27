/**
 * 进度条组件
 * 提供各种样式和功能的进度条
 */

/**
 * 创建进度条组件
 * @param {number} progress - 进度百分比 (0-100)
 * @param {string} text - 进度文本
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 进度条元素
 */
function createProgressBar(progress = 0, text = '', options = {}) {
  const {
    type = 'default', // default, success, warning, error
    size = 'medium', // small, medium, large
    showPercentage = true,
    animated = false,
    striped = false
  } = options;

  const progressContainer = document.createElement('div');
  progressContainer.className = `progress-container progress-${size}`;
  
  const progressBar = document.createElement('div');
  progressBar.className = `progress-bar progress-bar-${type}`;
  
  if (striped) {
    progressBar.classList.add('progress-bar-striped');
  }
  
  if (animated) {
    progressBar.classList.add('progress-bar-animated');
  }
  
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressBar);
  
  // 添加文本显示
  if (text || showPercentage) {
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    
    let displayText = text;
    if (showPercentage) {
      const percentage = `${Math.round(progress)}%`;
      displayText = text ? `${text} (${percentage})` : percentage;
    }
    
    progressText.textContent = displayText;
    progressContainer.appendChild(progressText);
  }
  
  return progressContainer;
}

/**
 * 更新进度条
 * @param {HTMLElement} progressContainer - 进度条容器元素
 * @param {number} progress - 新的进度百分比
 * @param {string} text - 新的进度文本
 * @param {Object} options - 更新选项
 */
function updateProgressBar(progressContainer, progress, text = '', options = {}) {
  const {
    animated = true,
    showPercentage = true
  } = options;

  const progressFill = progressContainer.querySelector('.progress-fill');
  const progressText = progressContainer.querySelector('.progress-text');
  
  if (progressFill) {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    if (animated) {
      progressFill.style.transition = 'width 0.3s ease';
    }
    
    progressFill.style.width = `${clampedProgress}%`;
    
    // 根据进度更改颜色
    const progressBar = progressContainer.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.classList.remove('progress-bar-success', 'progress-bar-warning', 'progress-bar-error');
      
      if (clampedProgress >= 100) {
        progressBar.classList.add('progress-bar-success');
      } else if (clampedProgress >= 75) {
        progressBar.classList.add('progress-bar-default');
      } else if (clampedProgress >= 50) {
        progressBar.classList.add('progress-bar-warning');
      }
    }
  }
  
  if (progressText) {
    let displayText = text;
    if (showPercentage) {
      const percentage = `${Math.round(progress)}%`;
      displayText = text ? `${text} (${percentage})` : percentage;
    }
    progressText.textContent = displayText;
  }
}

/**
 * 创建圆形进度条
 * @param {number} progress - 进度百分比 (0-100)
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 圆形进度条元素
 */
function createCircularProgress(progress = 0, options = {}) {
  const {
    size = 100,
    strokeWidth = 8,
    color = '#007bff',
    backgroundColor = '#e9ecef',
    showText = true,
    text = ''
  } = options;

  const container = document.createElement('div');
  container.className = 'circular-progress';
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  container.innerHTML = `
    <svg width="${size}" height="${size}" class="circular-progress-svg">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        stroke="${backgroundColor}"
        stroke-width="${strokeWidth}"
        fill="transparent"
        class="circular-progress-bg"
      />
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        fill="transparent"
        stroke-dasharray="${circumference} ${circumference}"
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
        class="circular-progress-fill"
        transform="rotate(-90 ${size / 2} ${size / 2})"
      />
    </svg>
    ${showText ? `<div class="circular-progress-text">${text || Math.round(progress) + '%'}</div>` : ''}
  `;
  
  return container;
}

/**
 * 更新圆形进度条
 * @param {HTMLElement} container - 圆形进度条容器
 * @param {number} progress - 新的进度百分比
 * @param {string} text - 新的文本
 */
function updateCircularProgress(container, progress, text = '') {
  const svg = container.querySelector('.circular-progress-svg');
  const fill = container.querySelector('.circular-progress-fill');
  const textEl = container.querySelector('.circular-progress-text');
  
  if (fill && svg) {
    const size = parseInt(svg.getAttribute('width'));
    const strokeWidth = parseInt(fill.getAttribute('stroke-width'));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    
    fill.style.strokeDashoffset = offset;
  }
  
  if (textEl) {
    textEl.textContent = text || Math.round(progress) + '%';
  }
}

/**
 * 创建加载器组件
 * @param {string} text - 加载文本
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 加载器元素
 */
function createLoader(text = '加载中...', options = {}) {
  const {
    type = 'spinner', // spinner, dots, bars
    size = 'medium' // small, medium, large
  } = options;

  const loader = document.createElement('div');
  loader.className = `loader loader-${type} loader-${size}`;
  
  if (type === 'spinner') {
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      ${text ? `<div class="loader-text">${text}</div>` : ''}
    `;
  } else if (type === 'dots') {
    loader.innerHTML = `
      <div class="loader-dots">
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>
      ${text ? `<div class="loader-text">${text}</div>` : ''}
    `;
  } else if (type === 'bars') {
    loader.innerHTML = `
      <div class="loader-bars">
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
      </div>
      ${text ? `<div class="loader-text">${text}</div>` : ''}
    `;
  }
  
  return loader;
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createProgressBar,
    updateProgressBar,
    createCircularProgress,
    updateCircularProgress,
    createLoader
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.ProgressUI = {
    createProgressBar,
    updateProgressBar,
    createCircularProgress,
    updateCircularProgress,
    createLoader
  };
  
  // 保持向后兼容
  window.createProgressBar = createProgressBar;
  window.updateProgressBar = updateProgressBar;
  window.createLoader = createLoader;
}