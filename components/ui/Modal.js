/**
 * 模态框组件
 * 提供确认对话框、自定义模态框等功能
 */

/**
 * 创建确认对话框
 * @param {string} message - 对话框消息
 * @param {Function} onConfirm - 确认回调函数
 * @param {Function} onCancel - 取消回调函数
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 对话框元素
 */
function createConfirmDialog(message, onConfirm, onCancel, options = {}) {
  const {
    confirmText = '确定',
    cancelText = '取消',
    title = '确认操作',
    type = 'warning'
  } = options;

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // 创建对话框
  const dialog = document.createElement('div');
  dialog.className = `modal-dialog confirm-dialog confirm-dialog-${type}`;
  
  // 根据类型选择图标
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
      case 'error': return '<i class="fas fa-times-circle"></i>';
      case 'info': return '<i class="fas fa-info-circle"></i>';
      case 'success': return '<i class="fas fa-check-circle"></i>';
      default: return '<i class="fas fa-question-circle"></i>';
    }
  };

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close" aria-label="关闭">&times;</button>
    </div>
    <div class="modal-body">
      <div class="confirm-content">
        <div class="confirm-icon ${type}">
          ${getIcon(type)}
        </div>
        <p class="confirm-message">${message}</p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary cancel-btn">${cancelText}</button>
      <button class="btn ${type === 'error' || type === 'warning' ? 'btn-danger' : 'btn-primary'} confirm-btn">${confirmText}</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // 获取按钮元素
  const cancelBtn = dialog.querySelector('.cancel-btn');
  const confirmBtn = dialog.querySelector('.confirm-btn');
  const closeBtn = dialog.querySelector('.modal-close');
  
  // 关闭对话框函数
  const closeDialog = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  };
  
  // 绑定事件
  cancelBtn.addEventListener('click', () => {
    closeDialog();
    if (onCancel) {
      onCancel();
    }
  });
  
  confirmBtn.addEventListener('click', () => {
    closeDialog();
    if (onConfirm) {
      onConfirm();
    }
  });

  closeBtn.addEventListener('click', () => {
    closeDialog();
    if (onCancel) {
      onCancel();
    }
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeDialog();
      if (onCancel) {
        onCancel();
      }
    }
  });
  
  // 键盘事件
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      if (onCancel) {
        onCancel();
      }
      document.removeEventListener('keydown', handleKeydown);
    } else if (e.key === 'Enter') {
      closeDialog();
      if (onConfirm) {
        onConfirm();
      }
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // 显示对话框
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    confirmBtn.focus();
  });
  
  return overlay;
}

/**
 * 创建自定义模态框
 * @param {string|HTMLElement} content - 模态框内容
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 模态框元素
 */
function createModal(content, options = {}) {
  const {
    title = '',
    size = 'medium', // small, medium, large, fullscreen
    closable = true,
    backdrop = true,
    onClose = null
  } = options;

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // 创建模态框
  const modal = document.createElement('div');
  modal.className = `modal-dialog modal-${size}`;
  
  let modalHTML = '';
  
  if (title) {
    modalHTML += `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        ${closable ? '<button class="modal-close" aria-label="关闭">&times;</button>' : ''}
      </div>
    `;
  }
  
  modalHTML += '<div class="modal-body"></div>';
  
  modal.innerHTML = modalHTML;
  
  // 添加内容
  const modalBody = modal.querySelector('.modal-body');
  if (typeof content === 'string') {
    modalBody.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    modalBody.appendChild(content);
  }
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // 关闭模态框函数
  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
    if (onClose) {
      onClose();
    }
  };
  
  // 绑定关闭事件
  if (closable) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    // ESC键关闭
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }
  
  // 点击背景关闭
  if (backdrop) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }
  
  // 显示模态框
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });
  
  // 返回控制对象
  return {
    element: overlay,
    close: closeModal,
    setContent: (newContent) => {
      if (typeof newContent === 'string') {
        modalBody.innerHTML = newContent;
      } else if (newContent instanceof HTMLElement) {
        modalBody.innerHTML = '';
        modalBody.appendChild(newContent);
      }
    }
  };
}

/**
 * 创建加载对话框
 * @param {string} text - 加载文本
 * @returns {Object} 加载对话框控制对象
 */
function createLoadingModal(text = '加载中...') {
  const content = `
    <div class="loading-content">
      <div className="loading-spinner" />
      <p class="loading-text">${text}</p>
    </div>
  `;
  
  return createModal(content, {
    size: 'small',
    closable: false,
    backdrop: false
  });
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createConfirmDialog,
    createModal,
    createLoadingModal
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境下添加到全局对象
  window.ModalUI = {
    createConfirmDialog,
    createModal,
    createLoadingModal
  };
  
  // 保持向后兼容
  window.createConfirmDialog = createConfirmDialog;
}