import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { createSuccessMessage, createErrorMessage } from '../components/ui/Message';
import { createConfirmDialog } from '../components/ui/Modal';
import { formatFileSize } from '../utils/fileUtils';
import { useFileSelection } from './useFileSelection';

/**
 * 批量操作管理钩子
 * 提供文件批量选择、删除、下载等功能
 * @param {Array} allFiles - 所有文件列表
 * @param {Array} filteredFiles - 过滤后的文件列表
 * @param {Function} onFilesChange - 文件列表变化回调
 * @returns {Object} 批量操作相关的状态和方法
 */
export const useBatchOps = (allFiles = [], filteredFiles = [], onFilesChange) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 使用新的文件选择Hook
  const {
    selectedFiles,
    selectedCount,
    isAllSelected,
    isPartiallySelected,
    selectedTotalSize,
    toggleSelection,
    selectAll,
    clearSelection
  } = useFileSelection(allFiles, filteredFiles);

  /**
   * 选中的文件详细信息
   */
  const selectedFileDetails = useMemo(() => {
    return allFiles.filter(file => selectedFiles.includes(file.messageId || file.id));
  }, [allFiles, selectedFiles]);

  /**
   * 兼容性方法：选择/取消选择文件
   * @param {string} fileId - 文件ID
   */
  const toggleFileSelection = useCallback((fileId) => {
    toggleSelection(fileId);
  }, [toggleSelection]);

  /**
   * 兼容性方法：全选/取消全选
   */
  const toggleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  /**
   * 批量删除文件
   */
  const batchDelete = useCallback(async () => {
    if (selectedFiles.length === 0) {
      createErrorMessage('请先选择要删除的文件');
      return;
    }

    const confirmed = await createConfirmDialog(
      `确定要删除选中的 ${selectedFiles.length} 个文件吗？此操作不可撤销。`
    );

    if (!confirmed) return;

    // 显示批量删除进度消息
    const progressMessage = createSuccessMessage(`正在删除 ${selectedFiles.length} 个文件...`, {
      position: 'top-right',
      duration: 0 // 不自动消失
    });

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;
    const errorDetails = {
      timeout: 0,
      network: 0,
      service: 0,
      other: 0
    };

    try {
      // 并发删除文件，但限制并发数
      const batchSize = 5;
      for (let i = 0; i < selectedFiles.length; i += batchSize) {
        const batch = selectedFiles.slice(i, i + batchSize);
        const promises = batch.map(async (fileId) => {
          try {
            await axios.delete(`/api/files?messageId=${fileId}`);
            successCount++;
          } catch (error) {
            console.error(`删除文件 ${fileId} 失败:`, error);
            errorCount++;
            
            // 统计错误类型
            if (error.response && error.response.data) {
              const { errorType } = error.response.data;
              switch (errorType) {
                case 'NETWORK_TIMEOUT':
                  errorDetails.timeout++;
                  break;
                case 'SERVICE_UNAVAILABLE':
                  errorDetails.service++;
                  break;
                case 'NETWORK_ERROR':
                  errorDetails.network++;
                  break;
                default:
                  errorDetails.other++;
              }
            } else {
              errorDetails.other++;
            }
          }
        });

        await Promise.all(promises);
        
        // 更新进度消息
        if (progressMessage && progressMessage.updateContent) {
          const processed = Math.min(i + batchSize, selectedFiles.length);
          progressMessage.updateContent(`正在删除文件... (${processed}/${selectedFiles.length})`);
        }
      }

      // 移除进度消息
      if (progressMessage && progressMessage.remove) {
        progressMessage.remove();
      }

      // 显示结果消息
      if (successCount > 0) {
        createSuccessMessage(`成功删除 ${successCount} 个文件`);
      }
      
      if (errorCount > 0) {
        let errorMessage = `${errorCount} 个文件删除失败`;
        
        // 根据错误类型提供更具体的信息
        if (errorDetails.timeout > 0) {
          errorMessage += `，其中 ${errorDetails.timeout} 个因网络超时失败`;
        }
        if (errorDetails.network > 0) {
          errorMessage += `，${errorDetails.network} 个因网络连接失败`;
        }
        if (errorDetails.service > 0) {
          errorMessage += `，${errorDetails.service} 个因服务不可用失败`;
        }
        
        createErrorMessage(errorMessage);
      }

      // 清空选择并刷新文件列表
      setSelectedFiles([]);
      if (onFilesChange) {
        onFilesChange();
      }

    } catch (error) {
      console.error('批量删除失败:', error);
      
      // 移除进度消息
      if (progressMessage && progressMessage.remove) {
        progressMessage.remove();
      }
      
      createErrorMessage('批量删除操作失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, onFilesChange]);

  /**
   * 批量下载文件
   */
  const batchDownload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      createErrorMessage('请先选择要下载的文件');
      return;
    }

    setIsProcessing(true);

    try {
      // 如果只有一个文件，直接下载
      if (selectedFiles.length === 1) {
        const file = selectedFileDetails[0];
        window.open(
          `/api/download?fileId=${file.fileId}&fileName=${encodeURIComponent(file.fileName)}`,
          '_blank'
        );
      } else {
        // 多个文件，创建压缩包下载
        const response = await axios.post('/api/batch-download', {
          fileIds: selectedFiles
        }, {
          responseType: 'blob'
        });

        // 创建下载链接
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `batch_download_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        createSuccessMessage(`开始下载 ${selectedFiles.length} 个文件的压缩包`);
      }
    } catch (error) {
      console.error('批量下载失败:', error);
      createErrorMessage('批量下载失败');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, selectedFileDetails]);

  /**
   * 批量生成短链接
   */
  const batchGenerateShortLinks = useCallback(async () => {
    if (selectedFiles.length === 0) {
      createErrorMessage('请先选择要生成短链接的文件');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;
    const shortLinks = [];

    try {
      for (const fileId of selectedFiles) {
        try {
          const response = await axios.post('/api/shortlink', { fileId });
          if (response.data.success) {
            shortLinks.push({
              fileId,
              fileName: selectedFileDetails.find(f => (f.messageId || f.id) === fileId)?.fileName,
              shortLink: response.data.shortLink
            });
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`生成短链接失败 ${fileId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        createSuccessMessage(`成功生成 ${successCount} 个短链接`);
        
        // 将短链接复制到剪贴板
        const linkText = shortLinks.map(item => 
          `${item.fileName}: ${item.shortLink}`
        ).join('\n');
        
        try {
          await navigator.clipboard.writeText(linkText);
          createSuccessMessage('短链接已复制到剪贴板');
        } catch (clipboardError) {
          console.warn('复制到剪贴板失败:', clipboardError);
        }
      }

      if (errorCount > 0) {
        createErrorMessage(`${errorCount} 个文件的短链接生成失败`);
      }

    } catch (error) {
      console.error('批量生成短链接失败:', error);
      createErrorMessage('批量生成短链接失败');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, selectedFileDetails]);

  /**
   * 检查是否有文件被选中
   */
  const hasSelection = selectedCount > 0;

  return {
    // 状态
    selectedFiles,
    selectedFileDetails,
    selectedTotalSize,
    selectedTotalSizeFormatted: formatFileSize(selectedTotalSize),
    selectedCount,
    isProcessing,
    hasSelection,
    isAllSelected,
    isPartiallySelected,
    
    // 方法
    toggleFileSelection,
    toggleSelectAll,
    clearSelection,
    batchDelete,
    batchDownload,
    batchGenerateShortLinks
  };
};

export default useBatchOps;