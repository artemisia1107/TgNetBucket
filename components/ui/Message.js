/**
 * 消息提示组件
 * 提供成功、错误、警告、信息等类型的消息提示功能
 */

/**
 * 创建消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'warning', 'info')
 * @param {number} duration - 显示时长（毫秒），默认3000ms
 * @returns {HTMLElement} 消息元素
 */
function createMessage(message, type = 'info', duration = 3000) {
  // 创建消息容器
  const messageContainer = document.createElement('div');
  messageContainer.className = `message message-${type}`;
  messageContainer.textContent = message;
  
  // 添加到页面
  document.body.appendChild(messageContainer);
  
  // 显示动画
  requestAnimationFrame(() => {
    messageContainer.classList.add('show');
  });
  
  // 自动移除
  setTimeout(() => {
    messageContainer.classList.remove('show');
    setTimeout(() => {
      if (messageContainer.parentNode) {
        messageContainer.parentNode.removeChild(messageContainer);
      }
    }, 300);
  }, duration);
  
  return messageContainer;
}

/**
 * 创建成功消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @returns {HTMLElement} 消息元素
 */
function createSuccessMessage(message, duration = 3000) {
  return createMessage(message, 'success', duration);
}

/**
 * 创建错误消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @returns {HTMLElement} 消息元素
 */
function createErrorMessage(message, duration = 4000) {
  return createMessage(message, 'error', duration);
}

/**
 * 创建警告消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @returns {HTMLElement} 消息元素
 */
function createWarningMessage(message, duration = 3500) {
  return createMessage(message, 'warning', duration);
}

/**
 * 创建信息消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 * @returns {HTMLElement} 消息元素
 */
function createInfoMessage(message, duration = 3000) {
  return createMessage(message, 'info', duration);
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