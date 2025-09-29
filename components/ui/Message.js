/**
 * 消息提示组件
 * 提供成功、错误、警告、信息等类型的消息提示功能
 */

/**
 * 创建消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success' | 'error' | 'info')
 * @param {Object} options - 配置选项
 * @param {number} options.duration - 显示时长（毫秒），0表示不自动消失
 * @param {string} options.position - 消息位置
 * @returns {Object} 包含元素引用和控制方法的对象
 */
function createMessage(message, type = 'info', options = {}) {
  const { duration = 3000, position = 'top-right' } = options;
  
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

  let autoRemoveTimeout = null;
  
  // 自动移除（如果duration > 0）
  if (duration > 0) {
    autoRemoveTimeout = setTimeout(() => {
      removeMessage();
    }, duration);
  }
  
  // 移除消息的方法
  function removeMessage() {
    if (autoRemoveTimeout) {
      clearTimeout(autoRemoveTimeout);
      autoRemoveTimeout = null;
    }
    
    messageContainer.classList.remove('visible');
    setTimeout(() => {
      if (messageContainer.parentNode) {
        document.body.removeChild(messageContainer);
      }
    }, 300);
  }
  
  // 更新消息内容的方法
  function updateContent(newMessage) {
    messageContainer.textContent = newMessage;
  }
  
  // 返回控制对象
  return {
    element: messageContainer,
    remove: removeMessage,
    updateContent: updateContent
  };
}

/**
 * 创建成功消息
 * @param {string} message - 消息内容
 * @param {Object|number} options - 配置选项或持续时间（向后兼容）
 * @param {string} position - 消息位置（向后兼容）
 * @returns {Object} 消息控制对象
 */
function createSuccessMessage(message, options = {}, position = 'top-right') {
  // 向后兼容：如果第二个参数是数字，则视为duration
  if (typeof options === 'number') {
    options = { duration: options, position };
  }
  return createMessage(message, 'success', { duration: 3000, position: 'top-right', ...options });
}

/**
 * 创建错误消息
 * @param {string} message - 消息内容
 * @param {Object|number} options - 配置选项或持续时间（向后兼容）
 * @param {string} position - 消息位置（向后兼容）
 * @returns {Object} 消息控制对象
 */
function createErrorMessage(message, options = {}, position = 'top-right') {
  // 向后兼容：如果第二个参数是数字，则视为duration
  if (typeof options === 'number') {
    options = { duration: options, position };
  }
  return createMessage(message, 'error', { duration: 4000, position: 'top-right', ...options });
}

/**
 * 创建警告消息
 * @param {string} message - 消息内容
 * @param {Object|number} options - 配置选项或持续时间（向后兼容）
 * @param {string} position - 消息位置（向后兼容）
 * @returns {Object} 消息控制对象
 */
function createWarningMessage(message, options = {}, position = 'top-right') {
  // 向后兼容：如果第二个参数是数字，则视为duration
  if (typeof options === 'number') {
    options = { duration: options, position };
  }
  return createMessage(message, 'warning', { duration: 3500, position: 'top-right', ...options });
}

/**
 * 创建信息消息
 * @param {string} message - 消息内容
 * @param {Object|number} options - 配置选项或持续时间（向后兼容）
 * @param {string} position - 消息位置（向后兼容）
 * @returns {Object} 消息控制对象
 */
function createInfoMessage(message, options = {}, position = 'top-right') {
  // 向后兼容：如果第二个参数是数字，则视为duration
  if (typeof options === 'number') {
    options = { duration: options, position };
  }
  return createMessage(message, 'info', { duration: 3000, position: 'top-right', ...options });
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