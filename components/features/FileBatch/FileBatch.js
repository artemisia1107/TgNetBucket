/**
 * 文件批量操作功能模块
 * 提供文件的批量选择、删除、下载等操作
 */

import axios from 'axios';
import { createMessage } from '../../ui/Message.js';
import { createConfirmDialog } from '../../ui/Modal.js';
import { copyToClipboard } from '../../../utils/commonUtils.js';

/**
 * 文件批量操作管理器类
 */
class FileBatchManager {
  constructor(options = {}) {
    this.options = {
      onSelectionChange: null,
      onBatchComplete: null,
      onError: null,
      maxBatchSize: 100,
      ...options
    };
    
    this.selectedFiles = new Set();
    this.allFiles = [];
  }

  /**
   * 设置文件列表
   * @param {Array} files - 文件列表
   */
  setFiles(files) {
    this.allFiles = files || [];
    // 清理不存在的选中文件
    this.selectedFiles = new Set(
      Array.from(this.selectedFiles).filter(fileId => 
        this.allFiles.some(file => file.fileId === fileId)
      )
    );
    this.notifySelectionChange();
  }

  /**
   * 切换文件选中状态
   * @param {string} fileId - 文件ID
   */
  toggleFileSelection(fileId) {
    if (this.selectedFiles.has(fileId)) {
      this.selectedFiles.delete(fileId);
    } else {
      this.selectedFiles.add(fileId);
    }
    this.notifySelectionChange();
  }

  /**
   * 全选/取消全选
   */
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  }

  /**
   * 选择所有文件
   */
  selectAll() {
    this.selectedFiles = new Set(this.allFiles.map(file => file.fileId));
    this.notifySelectionChange();
  }

  /**
   * 清空选择
   */
  clearSelection() {
    this.selectedFiles.clear();
    this.notifySelectionChange();
  }

  /**
   * 检查是否全选
   * @returns {boolean} 是否全选
   */
  isAllSelected() {
    return this.allFiles.length > 0 && this.selectedFiles.size === this.allFiles.length;
  }

  /**
   * 检查文件是否被选中
   * @param {string} fileId - 文件ID
   * @returns {boolean} 是否被选中
   */
  isFileSelected(fileId) {
    return this.selectedFiles.has(fileId);
  }

  /**
   * 获取选中的文件
   * @returns {Array} 选中的文件列表
   */
  getSelectedFiles() {
    return this.allFiles.filter(file => this.selectedFiles.has(file.fileId));
  }

  /**
   * 获取选中文件的数量
   * @returns {number} 选中文件数量
   */
  getSelectedCount() {
    return this.selectedFiles.size;
  }

  /**
   * 批量删除选中的文件
   */
  async batchDelete() {
    if (this.selectedFiles.size === 0) {
      createMessage('请先选择要删除的文件', 'warning');
      return;
    }

    if (this.selectedFiles.size > this.options.maxBatchSize) {
      createMessage(`一次最多只能删除 ${this.options.maxBatchSize} 个文件`, 'warning');
      return;
    }

    const selectedFiles = this.getSelectedFiles();
    const confirmMessage = `确定要删除选中的 ${this.selectedFiles.size} 个文件吗？此操作无法撤销。`;

    createConfirmDialog(confirmMessage, async () => {
      try {
        createMessage(`正在删除 ${this.selectedFiles.size} 个文件...`, 'info');
        
        // 并发删除文件
        const deletePromises = Array.from(this.selectedFiles).map(fileId => {
          const file = selectedFiles.find(f => f.fileId === fileId);
          return this.deleteSingleFile(file);
        });

        const results = await Promise.allSettled(deletePromises);
        
        // 统计结果
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        const failureCount = results.filter(result => result.status === 'rejected').length;

        if (successCount > 0) {
          createMessage(`成功删除 ${successCount} 个文件！`, 'success');
        }

        if (failureCount > 0) {
          createMessage(`${failureCount} 个文件删除失败`, 'error');
        }

        // 清空选择
        this.clearSelection();

        // 通知批量操作完成
        if (this.options.onBatchComplete) {
          this.options.onBatchComplete('delete', {
            total: this.selectedFiles.size,
            success: successCount,
            failure: failureCount
          });
        }

      } catch (error) {
        createMessage(`批量删除失败: ${error.message}`, 'error');
        if (this.options.onError) {
          this.options.onError('delete', error);
        }
      }
    });
  }

  /**
   * 删除单个文件
   * @param {Object} file - 文件对象
   * @returns {Promise} 删除结果
   */
  async deleteSingleFile(file) {
    try {
      await axios.delete(`/api/files?messageId=${file.messageId || file.fileId}`);
      return { success: true, file };
    } catch (error) {
      console.error(`删除文件 ${file.fileName} 失败:`, error);
      throw new Error(`删除文件 ${file.fileName} 失败: ${error.message}`);
    }
  }

  /**
   * 批量下载选中的文件
   */
  async batchDownload() {
    if (this.selectedFiles.size === 0) {
      createMessage('请先选择要下载的文件', 'warning');
      return;
    }

    const selectedFiles = this.getSelectedFiles();
    
    if (selectedFiles.length === 1) {
      // 单文件直接下载
      this.downloadSingleFile(selectedFiles[0]);
    } else {
      // 多文件提示用户
      createMessage(`开始下载 ${selectedFiles.length} 个文件，请注意浏览器下载提示`, 'info');
      
      // 延迟下载，避免浏览器阻止多个下载
      for (let i = 0; i < selectedFiles.length; i++) {
        setTimeout(() => {
          this.downloadSingleFile(selectedFiles[i]);
        }, i * 500); // 每个文件间隔500ms
      }
    }

    if (this.options.onBatchComplete) {
      this.options.onBatchComplete('download', {
        total: selectedFiles.length,
        files: selectedFiles
      });
    }
  }

  /**
   * 下载单个文件
   * @param {Object} file - 文件对象
   */
  downloadSingleFile(file) {
    const downloadUrl = `/api/download?fileId=${file.fileId}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.fileName || 'download';
    link.target = '_blank';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 批量生成短链接
   */
  async batchGenerateShortLinks() {
    if (this.selectedFiles.size === 0) {
      createMessage('请先选择要生成短链接的文件', 'warning');
      return;
    }

    if (this.selectedFiles.size > 10) {
      createMessage('一次最多只能为 10 个文件生成短链接', 'warning');
      return;
    }

    const selectedFiles = this.getSelectedFiles();
    
    try {
      createMessage(`正在为 ${selectedFiles.length} 个文件生成短链接...`, 'info');
      
      const linkPromises = selectedFiles.map(file => 
        this.generateShortLinkForFile(file)
      );

      const results = await Promise.allSettled(linkPromises);
      
      // 收集成功的链接
      const successResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      const failureCount = results.filter(result => result.status === 'rejected').length;

      if (successResults.length > 0) {
        // 将所有链接合并到剪贴板
        const allLinks = successResults.map(result => 
          `${result.file.fileName}: ${result.shortUrl}`
        ).join('\n');

        const success = await copyToClipboard(allLinks);
        if (success) {
          createMessage(`成功生成 ${successResults.length} 个短链接并复制到剪贴板`, 'success');
        } else {
          createMessage(`成功生成 ${successResults.length} 个短链接`, 'success');
        }
      }

      if (failureCount > 0) {
        createMessage(`${failureCount} 个文件的短链接生成失败`, 'error');
      }

      if (this.options.onBatchComplete) {
        this.options.onBatchComplete('shortlink', {
          total: selectedFiles.length,
          success: successResults.length,
          failure: failureCount,
          links: successResults
        });
      }

    } catch (error) {
      createMessage(`批量生成短链接失败: ${error.message}`, 'error');
      if (this.options.onError) {
        this.options.onError('shortlink', error);
      }
    }
  }

  /**
   * 为单个文件生成短链接
   * @param {Object} file - 文件对象
   * @returns {Promise} 生成结果
   */
  async generateShortLinkForFile(file) {
    try {
      const response = await axios.post('/api/short-link', {
        fileId: file.fileId,
        expiresIn: 3600 // 1小时过期
      });

      if (response.data.success) {
        return {
          file,
          shortUrl: response.data.shortUrl,
          success: true
        };
      } else {
        throw new Error(response.data.error || '生成短链接失败');
      }
    } catch (error) {
      console.error(`为文件 ${file.fileName} 生成短链接失败:`, error);
      throw new Error(`为文件 ${file.fileName} 生成短链接失败: ${error.message}`);
    }
  }

  /**
   * 获取选中文件的总大小
   * @returns {number} 总大小（字节）
   */
  getSelectedTotalSize() {
    return this.getSelectedFiles().reduce((total, file) => {
      return total + (file.fileSize || 0);
    }, 0);
  }

  /**
   * 按类型筛选选中的文件
   * @param {string} type - 文件类型
   * @returns {Array} 筛选后的文件列表
   */
  getSelectedFilesByType(type) {
    return this.getSelectedFiles().filter(file => {
      const fileType = this.getFileType(file.fileName);
      return fileType === type;
    });
  }

  /**
   * 获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型
   */
  getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      return 'document';
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return 'archive';
    } else {
      return 'other';
    }
  }

  /**
   * 通知选择状态变化
   */
  notifySelectionChange() {
    if (this.options.onSelectionChange) {
      this.options.onSelectionChange({
        selectedCount: this.selectedFiles.size,
        totalCount: this.allFiles.length,
        isAllSelected: this.isAllSelected(),
        selectedFiles: this.getSelectedFiles()
      });
    }
  }

  /**
   * 导出选中文件信息
   * @param {string} format - 导出格式 ('json', 'csv', 'txt')
   * @returns {string} 导出内容
   */
  exportSelectedFiles(format = 'json') {
    const selectedFiles = this.getSelectedFiles();
    
    switch (format) {
      case 'json':
        return JSON.stringify(selectedFiles, null, 2);
      
      case 'csv':
        const headers = ['文件名', '大小', '类型', '上传时间'];
        const rows = selectedFiles.map(file => [
          file.fileName,
          file.fileSize || 0,
          file.mimeType || '',
          file.uploadTime || ''
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
      
      case 'txt':
        return selectedFiles.map(file => 
          `${file.fileName} (${file.fileSize || 0} bytes)`
        ).join('\n');
      
      default:
        return JSON.stringify(selectedFiles);
    }
  }
}

/**
 * 创建批量操作管理器实例
 * @param {Object} options - 配置选项
 * @returns {FileBatchManager} 批量操作管理器实例
 */
function createFileBatch(options = {}) {
  return new FileBatchManager(options);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FileBatchManager,
    createFileBatch
  };
} else if (typeof window !== 'undefined') {
  window.FileBatch = {
    FileBatchManager,
    createFileBatch
  };
}