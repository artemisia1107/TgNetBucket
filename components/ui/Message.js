/**
 * 消息提示组件
 * 提供成功、错误、警告、信息等类型的消息提示功能
 */

/**
 * 创建消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success' | 'error' | 'info')
 * @param {number} duration - 显示时长（毫秒）
 * @param {string} position - 消息位置 ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center')
 */
function createMessage(message, type = 'info', duration = 3000, position = 'top-right') {
  // 创建消息容器
  const messageContainer = document.createElement('div');
  
  // 设置基础类名和位置类名
  let className = `message ${type}`;
  switch (position) {
    case 'top-left':
      className += ' message-top-left';
      break;
    case 'top-center':
      className += ' message-top-center';
      break;
    case 'bottom-right':
      className += ' message-bottom-right';
      break;
    case 'bottom-left':
      className += ' message-bottom-left';
      break;
    case 'bottom-center':
      className += ' message-bottom-center';
      break;
    case 'top-right':
    default:
      // 默认位置，不需要额外的类名
      break;
  }
  
  messageContainer.className = className;
  messageContainer.textContent = message;

  // 添加到页面
  document.body.appendChild(messageContainer);

  // 显示动画
  setTimeout(() => {
    messageContainer.classList.add('visible');
  }, 10);

  // 自动移除
  setTimeout(() => {
    messageContainer.classList.remove('visible');
    setTimeout(() => {
      if (messageContainer.parentNode) {
        document.body.removeChild(messageContainer);
      }
    }, 300);
  }, duration);
}

/**
 * 创建成功消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @param {string} position - 消息位置
 * @returns {HTMLElement} 消息元素
 */
function createSuccessMessage(message, duration = 3000, position = 'top-right') {
  return createMessage(message, 'success', duration, position);
}

/**
 * 创建错误消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @param {string} position - 消息位置
 * @returns {HTMLElement} 消息元素
 */
function createErrorMessage(message, duration = 4000, position = 'top-right') {
  return createMessage(message, 'error', duration, position);
}

/**
 * 创建警告消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @param {string} position - 消息位置
 * @returns {HTMLElement} 消息元素
 */
function createWarningMessage(message, duration = 3500, position = 'top-right') {
  return createMessage(message, 'warning', duration, position);
}

/**
 * 创建信息消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @param {string} position - 消息位置
 * @returns {HTMLElement} 消息元素
 */
function createInfoMessage(message, duration = 3000, position = 'top-right') {
  return createMessage(message, 'info', duration, position);
}

/**
 * 清除所有消息
 */
function clearAllMessages() {
  const messages = document.querySelectorAll('.message');
  messages.forEach(message => {
    message.classList.remove('show');
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 300);
  });
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createMessage,
    createSuccessMessage,
    createErrorMessage,
    createWarningMessage,
    createInfoMessage,
    clearAllMessages
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.MessageUI = {
    createMessage,
    createSuccessMessage,
    createErrorMessage,
    createWarningMessage,
    createInfoMessage,
    clearAllMessages
  };
  
  // 保持向后兼容
  window.createMessage = createMessage;
}