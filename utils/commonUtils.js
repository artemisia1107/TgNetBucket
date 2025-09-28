/**
 * 通用工具函数模块
 * 提供防抖、节流、复制、动画等通用功能
 */

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
// function debounce(func, wait, immediate = false) {
//   let timeout;
//   
//   return function executedFunction(...args) {
//     const later = () => {
//       timeout = null;
//       if (!immediate) func.apply(this, args);
//     };
//     
//     const callNow = immediate && !timeout;
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//     
//     if (callNow) func.apply(this, args);
//   };
// }

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
// function throttle(func, limit) {
//   let inThrottle;
//   
//   return function(...args) {
//     if (!inThrottle) {
//       func.apply(this, args);
//       inThrottle = true;
//       setTimeout(() => inThrottle = false, limit);
//     }
//   };
// }

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 复制是否成功
 */
// async function copyToClipboard(text) {
//   try {
//     // 优先使用现代 API
//     if (navigator.clipboard && window.isSecureContext) {
//       await navigator.clipboard.writeText(text);
//       return true;
//     }
//     
//     // 降级方案
//     const textArea = document.createElement('textarea');
//     textArea.value = text;
//     textArea.style.position = 'fixed';
//     textArea.style.left = '-999999px';
//     textArea.style.top = '-999999px';
//     document.body.appendChild(textArea);
//     textArea.focus();
//     textArea.select();
//     
//     const successful = document.execCommand('copy');
//     document.body.removeChild(textArea);
//     
//     return successful;
//   } catch (error) {
//     console.error('复制失败:', error);
//     return false;
//   }
// }

/**
 * 生成唯一ID
 * @param {string} prefix - 前缀
 * @returns {string} 唯一ID
 */
function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} 克隆后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * 对象深度合并
 * @param {Object} target - 目标对象
 * @param {...Object} sources - 源对象
 * @returns {Object} 合并后的对象
 */
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * 检查是否为对象
 * @param {any} item - 要检查的项
 * @returns {boolean} 是否为对象
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 等待指定时间
 * @param {number} ms - 等待时间（毫秒）
 * @returns {Promise} Promise对象
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * @param {Function} fn - 要重试的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试间隔（毫秒）
 * @returns {Promise} Promise对象
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await sleep(delay * Math.pow(2, i)); // 指数退避
      }
    }
  }
  
  throw lastError;
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
// function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {

/**
 * 格式化错误信息
 * @param {Error|string} error - 错误对象或错误信息
 * @returns {string} 格式化后的错误信息
 */
function formatError(error) {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || '未知错误';
  }
  
  if (error && typeof error === 'object') {
    return error.message || error.error || JSON.stringify(error);
  }
  
  return '未知错误';
}

/**
 * 检查是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检查是否支持触摸
 * @returns {boolean} 是否支持触摸
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 获取浏览器信息
 * @returns {Object} 浏览器信息
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  const browsers = {
    chrome: /Chrome/i.test(ua) && !/Edge/i.test(ua),
    firefox: /Firefox/i.test(ua),
    safari: /Safari/i.test(ua) && !/Chrome/i.test(ua),
    edge: /Edge/i.test(ua),
    ie: /MSIE|Trident/i.test(ua)
  };
  
  const browser = Object.keys(browsers).find(key => browsers[key]) || 'unknown';
  
  return {
    name: browser,
    userAgent: ua,
    isMobile: isMobile(),
    isTouch: isTouchDevice()
  };
}

/**
 * 动画工具类
 */
const AnimationUtils = {
  /**
   * 缓动函数
   */
  easing: {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },
  
  /**
   * 动画函数
   * @param {Object} options - 动画选项
   */
  animate(options) {
    const {
      duration = 300,
      easing = 'easeOutQuad',
      onUpdate = () => {},
      onComplete = () => {}
    } = options;
    
    const startTime = performance.now();
    const easingFn = this.easing[easing] || this.easing.linear;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      onUpdate(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  },
  
  /**
   * 淡入动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 动画时长
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    this.animate({
      duration,
      onUpdate: (progress) => {
        element.style.opacity = progress;
      }
    });
  },
  
  /**
   * 淡出动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 动画时长
   */
  fadeOut(element, duration = 300) {
    this.animate({
      duration,
      onUpdate: (progress) => {
        element.style.opacity = 1 - progress;
      },
      onComplete: () => {
        element.style.display = 'none';
      }
    });
  },
  
  /**
   * 滑入动画
   * @param {HTMLElement} element - 目标元素
   * @param {string} direction - 方向 ('up', 'down', 'left', 'right')
   * @param {number} duration - 动画时长
   */
  slideIn(element, direction = 'down', duration = 300) {
    const transforms = {
      up: 'translateY(100%)',
      down: 'translateY(-100%)',
      left: 'translateX(100%)',
      right: 'translateX(-100%)'
    };
    
    element.style.transform = transforms[direction] || transforms.down;
    element.style.display = 'block';
    
    this.animate({
      duration,
      onUpdate: (progress) => {
        const value = (1 - progress) * 100;
        const transform = direction === 'up' || direction === 'down' 
          ? `translateY(${direction === 'up' ? value : -value}%)`
          : `translateX(${direction === 'left' ? value : -value}%)`;
        element.style.transform = transform;
      },
      onComplete: () => {
        element.style.transform = '';
      }
    });
  }
};

/**
 * 本地存储工具
 */
const StorageUtils = {
  /**
   * 设置本地存储
   * @param {string} key - 键
   * @param {any} value - 值
   * @param {number} expiry - 过期时间（毫秒）
   */
  set(key, value, expiry = null) {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined') {
        return;
      }
      const item = {
        value,
        expiry: expiry ? Date.now() + expiry : null
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('存储失败:', error);
    }
  },
  
  /**
   * 获取本地存储
   * @param {string} key - 键
   * @returns {any} 值
   */
  get(key) {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined') {
        return null;
      }
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      // 检查是否过期
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('读取存储失败:', error);
      return null;
    }
  },
  
  /**
   * 删除本地存储
   * @param {string} key - 键
   */
  remove(key) {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除存储失败:', error);
    }
  },
  
  /**
   * 清空本地存储
   */
  clear() {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.clear();
    } catch (error) {
      console.error('清空存储失败:', error);
    }
  }
};

// 导出函数和对象
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    throttle,
    copyToClipboard,
    generateId,
    deepClone,
    deepMerge,
    isObject,
    sleep,
    retry,
    formatError,
    isMobile,
    isTouchDevice,
    getBrowserInfo,
    AnimationUtils,
    StorageUtils
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.CommonUtils = {
    debounce,
    throttle,
    copyToClipboard,
    generateId,
    deepClone,
    deepMerge,
    isObject,
    sleep,
    retry,
    formatError,
    isMobile,
    isTouchDevice,
    getBrowserInfo,
    AnimationUtils,
    StorageUtils
  };
  
  // 保持向后兼容
  window.debounce = debounce;
  window.throttle = throttle;
  window.copyToClipboard = copyToClipboard;
  window.AnimationUtils = AnimationUtils;
}