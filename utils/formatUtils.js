/**
 * 格式化工具函数模块
 * 提供日期、时间、数字等格式化功能
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, options = {}) {
  const {
    format = 'YYYY-MM-DD HH:mm:ss',
    locale = 'zh-CN',
    relative = false
  } = options;

  let dateObj;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '无效日期';
  }
  
  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }
  
  // 相对时间格式
  if (relative) {
    return formatRelativeTime(dateObj);
  }
  
  // 自定义格式
  if (format !== 'default') {
    return formatCustomDate(dateObj, format);
  }
  
  // 默认本地化格式
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * 格式化相对时间
 * @param {Date} date - 日期对象
 * @returns {string} 相对时间字符串
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
}

/**
 * 自定义日期格式化
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatCustomDate(date, format) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  const formatMap = {
    'YYYY': year.toString(),
    'YY': year.toString().slice(-2),
    'MM': month.toString().padStart(2, '0'),
    'M': month.toString(),
    'DD': day.toString().padStart(2, '0'),
    'D': day.toString(),
    'HH': hours.toString().padStart(2, '0'),
    'H': hours.toString(),
    'mm': minutes.toString().padStart(2, '0'),
    'm': minutes.toString(),
    'ss': seconds.toString().padStart(2, '0'),
    's': seconds.toString()
  };
  
  let result = format;
  Object.keys(formatMap).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), formatMap[key]);
  });
  
  return result;
}

/**
 * 格式化时间段
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间段字符串
 */
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`;
}

/**
 * 格式化数字
 * @param {number} number - 数字
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的数字字符串
 */
function formatNumber(number, options = {}) {
  const {
    decimals = 0,
    thousandsSeparator = ',',
    decimalSeparator = '.',
    prefix = '',
    suffix = ''
  } = options;
  
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  // 保留小数位
  const rounded = Number(number.toFixed(decimals));
  
  // 分离整数和小数部分
  const parts = rounded.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  
  // 添加千位分隔符
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // 组合结果
  let result = formattedInteger;
  if (decimalPart && decimals > 0) {
    result += decimalSeparator + decimalPart.padEnd(decimals, '0');
  }
  
  return prefix + result + suffix;
}

/**
 * 格式化百分比
 * @param {number} value - 数值 (0-1 或 0-100)
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的百分比字符串
 */
function formatPercentage(value, options = {}) {
  const {
    decimals = 1,
    isDecimal = true // true表示输入是0-1的小数，false表示输入是0-100的整数
  } = options;
  
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  const percentage = isDecimal ? value * 100 : value;
  return formatNumber(percentage, { decimals }) + '%';
}

/**
 * 格式化货币
 * @param {number} amount - 金额
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的货币字符串
 */
function formatCurrency(amount, options = {}) {
  const {
    currency = 'CNY',
    locale = 'zh-CN',
    decimals = 2
  } = options;
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '¥0.00';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  } catch (error) {
    // 降级处理
    const symbol = currency === 'CNY' ? '¥' : '$';
    return symbol + formatNumber(amount, { decimals });
  }
}

/**
 * 格式化文件大小（简化版）
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  
  return `${size} ${sizes[i]}`;
}

/**
 * 格式化速度
 * @param {number} bytesPerSecond - 每秒字节数
 * @returns {string} 格式化后的速度字符串
 */
function formatSpeed(bytesPerSecond) {
  return formatBytes(bytesPerSecond) + '/s';
}

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认为'...'
 * @returns {string} 截断后的文本
 */
function truncateText(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 首字母大写
 * @param {string} text - 原始文本
 * @returns {string} 首字母大写的文本
 */
function capitalize(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * 驼峰命名转换
 * @param {string} text - 原始文本
 * @returns {string} 驼峰命名的文本
 */
function toCamelCase(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    formatRelativeTime,
    formatCustomDate,
    formatDuration,
    formatNumber,
    formatPercentage,
    formatCurrency,
    formatBytes,
    formatSpeed,
    truncateText,
    capitalize,
    toCamelCase
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.FormatUtils = {
    formatDate,
    formatRelativeTime,
    formatCustomDate,
    formatDuration,
    formatNumber,
    formatPercentage,
    formatCurrency,
    formatBytes,
    formatSpeed,
    truncateText,
    capitalize,
    toCamelCase
  };
  
  // 保持向后兼容
  window.formatDate = formatDate;
}