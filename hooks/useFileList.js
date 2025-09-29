import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useDebounce } from './useDebounce';

/**
 * 文件列表管理钩子
 * 提供文件列表的获取、搜索、排序和过滤功能
 * @returns {Object} 文件列表相关的状态和方法
 */
export const useFileList = () => {
  // 基础状态
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadTime');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 防抖搜索词，延迟300ms执行搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  /**
   * 获取文件列表
   */
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/files');
      
      if (response.data && response.data.success) {
        if (Array.isArray(response.data.files)) {
          setFiles(response.data.files);
        } else {
          setFiles([]);
        }
      } else {
        setError('获取文件列表失败');
        setFiles([]);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      setError('获取文件列表失败');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 根据文件名获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型
   */
  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    return 'other';
  };

  /**
   * 过滤和排序后的文件列表
   */
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // 搜索过滤 - 使用防抖后的搜索词
    if (debouncedSearchTerm) {
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(file => getFileType(file.fileName) === filterType);
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'fileSize':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        case 'uploadTime':
        default:
          aValue = new Date(a.uploadTime || 0);
          bValue = new Date(b.uploadTime || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [files, debouncedSearchTerm, filterType, sortBy, sortOrder]);

  // 显示网络诊断结果的函数
  const showNetworkDiagnostics = (diagnostics) => {
    const { createInfoMessage } = import('../components/ui/Message');
    
    const healthStatus = diagnostics.overallHealth;
    let healthIcon = 'fas fa-check-circle';
    let healthColor = '#28a745';
    
    if (healthStatus === 'poor') {
      healthIcon = 'fas fa-times-circle';
      healthColor = '#dc3545';
    } else if (healthStatus === 'fair') {
      healthIcon = 'fas fa-exclamation-triangle';
      healthColor = '#ffc107';
    }
    
    const detailsHtml = diagnostics.details
      .map(detail => `
        <div style="margin: 5px 0; padding: 5px; border-left: 3px solid ${detail.status === 'success' ? '#28a745' : '#dc3545'};">
          <i class="${detail.icon}"></i> <strong>${detail.test}:</strong> ${detail.message}
        </div>
      `)
      .join('');
    
    const recommendationsHtml = diagnostics.recommendations && diagnostics.recommendations.length > 0
      ? `<div style="margin-top: 10px;">
          <strong><i class="fas fa-lightbulb"></i> 建议:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${diagnostics.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>`
      : '';
    
    const diagnosticHtml = `
      <div style="max-width: 500px;">
        <div style="margin-bottom: 10px;">
          <i class="${healthIcon}" style="color: ${healthColor};"></i> 
          <strong>网络健康状态: ${healthStatus === 'good' ? '良好' : healthStatus === 'fair' ? '一般' : '较差'}</strong>
        </div>
        ${detailsHtml}
        ${recommendationsHtml}
      </div>
    `;
    
    createInfoMessage(diagnosticHtml, { duration: 15000 });
  };

  /**
   * 删除文件
   * @param {string} messageId - 消息ID
   * @param {string} fileName - 文件名（用于确认提示）
   * @param {boolean} skipConfirm - 是否跳过确认对话框
   */
  const deleteFile = async (messageId, fileName = '', skipConfirm = false) => {
    // 获取要删除的文件信息
    const fileToDelete = files.find(file => file.messageId === messageId);
    if (!fileToDelete) {
      const { createErrorMessage } = await import('../components/ui/Message');
      createErrorMessage('<i class="fas fa-times-circle"></i> 文件不存在');
      return { success: false, error: '文件不存在' };
    }

    // 如果不跳过确认，显示确认对话框
    if (!skipConfirm) {
      const confirmMessage = fileName 
        ? `确定要删除文件 "${fileName}" 吗？此操作不可撤销。`
        : '确定要删除此文件吗？此操作不可撤销。';
      
      // 使用Promise包装确认对话框
      const confirmed = await new Promise((resolve) => {
        // 动态导入Modal组件
        import('../components/ui/Modal').then(({ createConfirmDialog }) => {
          createConfirmDialog(
            confirmMessage,
            () => resolve(true),  // 确认
            () => resolve(false), // 取消
            {
              title: '删除文件',
              confirmText: '删除',
              cancelText: '取消',
              type: 'warning'
            }
          );
        }).catch(() => {
          // 如果导入失败，回退到原生confirm
          resolve(window.confirm(confirmMessage));
        });
      });
      
      if (!confirmed) {
        return { success: false, cancelled: true };
      }
    }

    // 立即从UI中移除文件（乐观更新）
    setFiles(prevFiles => prevFiles.filter(file => file.messageId !== messageId));
    
    // 显示删除中的消息
    const { createInfoMessage, createSuccessMessage } = await import('../components/ui/Message');
    const deletingMessage = createInfoMessage(
      `<i class="fas fa-spinner fa-spin"></i> 正在删除 "${fileName || fileToDelete.fileName}"...`,
      { duration: 0 }
    );

    try {
      // 导入删除队列
      const { getDeleteQueue } = await import('../utils/deleteQueue');
      const deleteQueue = getDeleteQueue();
      
      // 添加到删除队列
      const taskId = await deleteQueue.addDeleteTask(
        messageId,
        fileToDelete,
        // 成功回调
        () => {
          if (deletingMessage && deletingMessage.remove) {
            deletingMessage.remove();
          }
          createSuccessMessage(`<i class="fas fa-check-circle"></i> "${fileName || fileToDelete.fileName}" 删除成功`);
        },
        // 错误回调
        (error) => {
          if (deletingMessage && deletingMessage.remove) {
            deletingMessage.remove();
          }
          
          // 恢复文件到列表中
          setFiles(prevFiles => {
            const exists = prevFiles.find(f => f.messageId === messageId);
            if (!exists) {
              return [...prevFiles, fileToDelete].sort((a, b) => 
                new Date(b.uploadTime) - new Date(a.uploadTime)
              );
            }
            return prevFiles;
          });
          
          // 显示错误信息
          handleDeleteError(error, messageId, fileToDelete);
        }
      );
      
      // 如果在线，立即开始处理队列
      if (navigator.onLine) {
        deleteQueue.processQueue();
      } else {
        if (deletingMessage && deletingMessage.remove) {
          deletingMessage.remove();
        }
        createInfoMessage(
          `<i class="fas fa-wifi"></i> 网络离线，"${fileName || fileToDelete.fileName}" 已加入删除队列，将在网络恢复后自动删除`,
          { duration: 5000 }
        );
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('删除队列初始化失败:', error);
      
      // 移除加载消息
      if (deletingMessage && deletingMessage.remove) {
        deletingMessage.remove();
      }
      
      // 恢复文件到列表中
      setFiles(prevFiles => {
        const exists = prevFiles.find(f => f.messageId === messageId);
        if (!exists) {
          return [...prevFiles, fileToDelete].sort((a, b) => 
            new Date(b.uploadTime) - new Date(a.uploadTime)
          );
        }
        return prevFiles;
      });
      
      // 显示错误信息
      const { createErrorMessage } = await import('../components/ui/Message');
      createErrorMessage(`<i class="fas fa-times-circle"></i> 删除队列初始化失败: ${error.message}`);
      
      return { success: false, error: '删除队列初始化失败' };
    }
  };

  /**
   * 处理删除错误
   * @param {Error} error - 错误对象
   * @param {string} messageId - 消息ID
   * @param {Object} fileToDelete - 要删除的文件对象
   */
  const handleDeleteError = async (error, messageId, fileToDelete) => {
    const { createErrorMessage, createWarningMessage, createInfoMessage } = await import('../components/ui/Message');
    
    // 根据错误类型显示不同的错误信息和重试选项
    let errorMessage = '删除文件失败，请稍后重试';
    let showRetryOption = false;
    let retryDelay = 3000;
    let errorIcon = 'fas fa-times-circle';
    let diagnostics = null;
    let suggestion = null;
    
    if (error.response && error.response.data) {
      const { errorType, error: apiError, retryable, retryDelay: apiRetryDelay, suggestion: apiSuggestion, diagnostics: apiDiagnostics } = error.response.data;
      
      errorMessage = apiError || apiSuggestion || '删除文件失败';
      showRetryOption = retryable;
      retryDelay = apiRetryDelay || 3000;
      suggestion = apiSuggestion;
      diagnostics = apiDiagnostics;
      
      // 根据错误类型提供更具体的处理
      switch (errorType) {
        case 'NETWORK_TIMEOUT':
          errorIcon = 'fas fa-clock';
          showRetryOption = true;
          break;
        case 'CONNECTION_RESET':
          errorIcon = 'fas fa-exclamation-triangle';
          showRetryOption = true;
          break;
        case 'API_CONNECTION_ERROR':
          errorIcon = 'fas fa-plug';
          showRetryOption = true;
          break;
        case 'SERVICE_UNAVAILABLE':
          errorIcon = 'fas fa-server';
          showRetryOption = true;
          break;
        case 'NETWORK_ERROR':
          errorIcon = 'fas fa-wifi';
          showRetryOption = true;
          break;
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorMessage = '网络连接失败，请检查网络连接';
      errorIcon = 'fas fa-wifi';
      showRetryOption = true;
    }
    
    // 显示错误消息
    const errorMessageElement = createErrorMessage(
      `<i class="${errorIcon}"></i> ${errorMessage}`,
      {
        duration: showRetryOption ? 0 : 5000 // 如果有重试选项，不自动消失
      }
    );
    
    // 如果支持重试，添加重试按钮
    if (showRetryOption && errorMessageElement && errorMessageElement.element) {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.marginTop = '10px';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '8px';
      
      // 重试按钮
      const retryButton = document.createElement('button');
      retryButton.className = 'btn btn-sm btn-primary';
      retryButton.innerHTML = `<i class="fas fa-redo"></i> 重试`;
      
      // 网络诊断按钮
      const diagnosticButton = document.createElement('button');
      diagnosticButton.className = 'btn btn-sm btn-info';
      diagnosticButton.innerHTML = `<i class="fas fa-stethoscope"></i> 网络诊断`;
      
      // 添加重试倒计时（可选）
      if (retryDelay > 0) {
        let countdown = Math.ceil(retryDelay / 1000);
        const updateCountdown = () => {
          if (countdown > 0) {
            retryButton.innerHTML = `<i class="fas fa-clock"></i> ${countdown}秒后可重试`;
            retryButton.disabled = true;
            countdown--;
            setTimeout(updateCountdown, 1000);
          } else {
            retryButton.innerHTML = `<i class="fas fa-redo"></i> 重试`;
            retryButton.disabled = false;
          }
        };
        updateCountdown();
      }
      
      retryButton.onclick = async () => {
        if (errorMessageElement.remove) {
          errorMessageElement.remove();
        }
        // 延迟后重试
        setTimeout(() => {
          deleteFile(messageId, fileToDelete.fileName, true); // 跳过确认对话框
        }, 1000);
      };
      
      // 网络诊断按钮点击事件
      diagnosticButton.onclick = async () => {
        diagnosticButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 诊断中...`;
        diagnosticButton.disabled = true;
        
        try {
          const response = await fetch('/api/network-diagnostics');
          const result = await response.json();
          
          if (result.success) {
            showNetworkDiagnostics(result.data);
          } else {
            createErrorMessage(`<i class="fas fa-times-circle"></i> 网络诊断失败: ${result.error}`);
          }
        } catch (diagError) {
          createErrorMessage(`<i class="fas fa-times-circle"></i> 网络诊断失败: ${diagError.message}`);
        } finally {
          diagnosticButton.innerHTML = `<i class="fas fa-stethoscope"></i> 网络诊断`;
          diagnosticButton.disabled = false;
        }
      };
      
      buttonContainer.appendChild(retryButton);
      buttonContainer.appendChild(diagnosticButton);
      errorMessageElement.element.appendChild(buttonContainer);
    }
    
    // 如果有诊断信息，显示简要诊断结果
    if (diagnostics && diagnostics.details) {
      setTimeout(() => {
        const diagSummary = diagnostics.details
          .filter(detail => detail.status === 'error')
          .map(detail => `<i class="${detail.icon}"></i> ${detail.message}`)
          .join('<br>');
        
        if (diagSummary) {
          createWarningMessage(
            `<i class="fas fa-info-circle"></i> 自动诊断结果:<br>${diagSummary}`,
            { duration: 8000 }
          );
        }
      }, 1500);
    }
    
    // 如果有建议，显示建议信息
    if (suggestion) {
      setTimeout(() => {
        createInfoMessage(
          `<i class="fas fa-lightbulb"></i> 建议: ${suggestion}`, 
          { duration: 6000 }
        );
      }, 1000);
    }
  };

  /**
   * 生成短链接
   * @param {string} fileId - 文件ID
   */
  const generateShortLink = async (fileId) => {
    try {
      const response = await axios.post('/api/short-link', { fileId });
      return { 
        success: true, 
        shortLink: response.data.shortUrl,
        shortUrl: response.data.shortUrl,
        shortId: response.data.shortId,
        expiresIn: response.data.expiresIn,
        isExisting: response.data.isExisting
      };
    } catch (error) {
      console.error('生成短链接失败:', error);
      return { success: false, error: error.response?.data?.error || '生成短链接失败' };
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    // 状态
    files: filteredAndSortedFiles,
    rawFiles: files, // 原始文件数据
    loading,
    error,
    searchTerm,
    filterType,
    sortBy,
    sortOrder,
    
    // 方法
    fetchFiles,
    deleteFile,
    generateShortLink,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setSortOrder,
    getFileType
  };
};

export default useFileList;