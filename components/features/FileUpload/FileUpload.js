/**
 * 文件上传功能模块
 * 提供单文件和批量文件上传功能
 */

import axios from 'axios';
import { createMessage } from '../../ui/Message.js';
// import { createProgressBar, updateProgressBar } from '../../ui/ProgressBar.js';
import { formatFileSize } from '../../../utils/fileUtils.js';
import { FILE_CONFIG, UPLOAD_CONFIG } from '../../../constants/config.js';

/**
 * 文件上传管理器类
 */
class FileUploadManager {
  constructor(options = {}) {
    this.options = {
      maxFileSize: FILE_CONFIG.MAX_FILE_SIZE,
      maxTotalSize: FILE_CONFIG.MAX_TOTAL_SIZE,
      allowedTypes: FILE_CONFIG.ALLOWED_TYPES,
      maxConcurrent: UPLOAD_CONFIG.MAX_CONCURRENT,
      chunkSize: UPLOAD_CONFIG.CHUNK_SIZE,
      onProgress: null,
      onSuccess: null,
      onError: null,
      onComplete: null,
      ...options
    };
    
    this.uploadQueue = [];
    this.activeUploads = 0;
    this.totalProgress = 0;
  }

  /**
   * 验证文件
   * @param {File} file - 文件对象
   * @returns {Object} 验证结果
   */
  validateFile(file) {
    const errors = [];
    
    // 检查文件大小
    if (file.size > this.options.maxFileSize) {
      errors.push(`文件大小超过限制 (${formatFileSize(this.options.maxFileSize)})`);
    }
    
    // 检查文件类型
    if (this.options.allowedTypes.length > 0 && !this.options.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.type}`);
    }
    
    // 检查文件名
    if (!file.name || file.name.trim() === '') {
      errors.push('文件名不能为空');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 添加文件到上传队列
   * @param {File|FileList|Array} files - 文件或文件列表
   * @returns {Array} 添加的文件项
   */
  addFiles(files) {
    const fileArray = Array.from(files);
    const addedFiles = [];
    
    for (const file of fileArray) {
      const validation = this.validateFile(file);
      
      const fileItem = {
        id: this.generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: UPLOAD_CONFIG.STATUS.PENDING,
        progress: 0,
        error: null,
        validation
      };
      
      if (!validation.isValid) {
        fileItem.status = UPLOAD_CONFIG.STATUS.ERROR;
        fileItem.error = validation.errors.join(', ');
        createMessage(`文件 ${file.name} 验证失败: ${fileItem.error}`, 'error');
      }
      
      this.uploadQueue.push(fileItem);
      addedFiles.push(fileItem);
    }
    
    return addedFiles;
  }

  /**
   * 开始上传
   */
  async startUpload() {
    const pendingFiles = this.uploadQueue.filter(item => 
      item.status === UPLOAD_CONFIG.STATUS.PENDING && item.validation.isValid
    );
    
    if (pendingFiles.length === 0) {
      createMessage('没有可上传的文件', 'warning');
      return;
    }
    
    createMessage(`开始上传 ${pendingFiles.length} 个文件`, 'info');
    
    // 并发上传
    const uploadPromises = [];
    for (let i = 0; i < Math.min(pendingFiles.length, this.options.maxConcurrent); i++) {
      uploadPromises.push(this.processUploadQueue());
    }
    
    try {
      await Promise.all(uploadPromises);
      this.onUploadComplete();
    } catch (error) {
      console.error('上传过程中发生错误:', error);
    }
  }

  /**
   * 处理上传队列
   */
  async processUploadQueue() {
    while (true) {
      const fileItem = this.getNextPendingFile();
      if (!fileItem) break;
      
      this.activeUploads++;
      
      try {
        await this.uploadSingleFile(fileItem);
      } catch (error) {
        this.handleUploadError(fileItem, error);
      } finally {
        this.activeUploads--;
      }
    }
  }

  /**
   * 获取下一个待上传文件
   * @returns {Object|null} 文件项
   */
  getNextPendingFile() {
    return this.uploadQueue.find(item => 
      item.status === UPLOAD_CONFIG.STATUS.PENDING && item.validation.isValid
    );
  }

  /**
   * 上传单个文件
   * @param {Object} fileItem - 文件项
   */
  async uploadSingleFile(fileItem) {
    fileItem.status = UPLOAD_CONFIG.STATUS.UPLOADING;
    
    const formData = new FormData();
    formData.append('file', fileItem.file);
    
    try {
      const response = await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          this.updateFileProgress(fileItem.id, progress);
        },
        timeout: 30000 // 30秒超时
      });

      if (response.data.success) {
        fileItem.status = UPLOAD_CONFIG.STATUS.SUCCESS;
        fileItem.progress = 100;
        fileItem.result = response.data;
        
        createMessage(`文件 ${fileItem.name} 上传成功`, 'success');
        
        if (this.options.onSuccess) {
          this.options.onSuccess(fileItem, response.data);
        }
      } else {
        throw new Error(response.data.error || '上传失败');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新文件上传进度
   * @param {string} fileId - 文件ID
   * @param {number} progress - 进度百分比
   */
  updateFileProgress(fileId, progress) {
    const fileItem = this.uploadQueue.find(item => item.id === fileId);
    if (fileItem) {
      fileItem.progress = progress;
      
      // 计算总进度
      this.calculateTotalProgress();
      
      if (this.options.onProgress) {
        this.options.onProgress(fileItem, this.totalProgress);
      }
    }
  }

  /**
   * 计算总上传进度
   */
  calculateTotalProgress() {
    const validFiles = this.uploadQueue.filter(item => item.validation.isValid);
    if (validFiles.length === 0) {
      this.totalProgress = 0;
      return;
    }
    
    const totalProgress = validFiles.reduce((sum, item) => sum + item.progress, 0);
    this.totalProgress = Math.round(totalProgress / validFiles.length);
  }

  /**
   * 处理上传错误
   * @param {Object} fileItem - 文件项
   * @param {Error} error - 错误对象
   */
  handleUploadError(fileItem, error) {
    fileItem.status = UPLOAD_CONFIG.STATUS.ERROR;
    fileItem.error = error.message || '上传失败';
    
    createMessage(`文件 ${fileItem.name} 上传失败: ${fileItem.error}`, 'error');
    
    if (this.options.onError) {
      this.options.onError(fileItem, error);
    }
  }

  /**
   * 上传完成处理
   */
  onUploadComplete() {
    const successCount = this.uploadQueue.filter(item => 
      item.status === UPLOAD_CONFIG.STATUS.SUCCESS
    ).length;
    
    const errorCount = this.uploadQueue.filter(item => 
      item.status === UPLOAD_CONFIG.STATUS.ERROR
    ).length;
    
    if (successCount > 0) {
      createMessage(`成功上传 ${successCount} 个文件`, 'success');
    }
    
    if (errorCount > 0) {
      createMessage(`${errorCount} 个文件上传失败`, 'error');
    }
    
    if (this.options.onComplete) {
      this.options.onComplete({
        total: this.uploadQueue.length,
        success: successCount,
        error: errorCount,
        files: this.uploadQueue
      });
    }
  }

  /**
   * 取消上传
   * @param {string} fileId - 文件ID，如果不提供则取消所有上传
   */
  cancelUpload(fileId = null) {
    if (fileId) {
      const fileItem = this.uploadQueue.find(item => item.id === fileId);
      if (fileItem && fileItem.status === UPLOAD_CONFIG.STATUS.UPLOADING) {
        fileItem.status = UPLOAD_CONFIG.STATUS.CANCELLED;
        createMessage(`已取消上传文件 ${fileItem.name}`, 'info');
      }
    } else {
      // 取消所有上传
      this.uploadQueue.forEach(item => {
        if (item.status === UPLOAD_CONFIG.STATUS.UPLOADING || 
            item.status === UPLOAD_CONFIG.STATUS.PENDING) {
          item.status = UPLOAD_CONFIG.STATUS.CANCELLED;
        }
      });
      createMessage('已取消所有上传任务', 'info');
    }
  }

  /**
   * 清空上传队列
   */
  clearQueue() {
    this.uploadQueue = [];
    this.activeUploads = 0;
    this.totalProgress = 0;
  }

  /**
   * 获取上传队列状态
   * @returns {Object} 队列状态
   */
  getQueueStatus() {
    const pending = this.uploadQueue.filter(item => item.status === UPLOAD_CONFIG.STATUS.PENDING).length;
    const uploading = this.uploadQueue.filter(item => item.status === UPLOAD_CONFIG.STATUS.UPLOADING).length;
    const success = this.uploadQueue.filter(item => item.status === UPLOAD_CONFIG.STATUS.SUCCESS).length;
    const error = this.uploadQueue.filter(item => item.status === UPLOAD_CONFIG.STATUS.ERROR).length;
    const cancelled = this.uploadQueue.filter(item => item.status === UPLOAD_CONFIG.STATUS.CANCELLED).length;
    
    return {
      total: this.uploadQueue.length,
      pending,
      uploading,
      success,
      error,
      cancelled,
      progress: this.totalProgress,
      isActive: this.activeUploads > 0
    };
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

/**
 * 创建文件上传实例
 * @param {Object} options - 配置选项
 * @returns {FileUploadManager} 上传管理器实例
 */
function createFileUpload(options = {}) {
  return new FileUploadManager(options);
}

/**
 * 快速上传单个文件
 * @param {File} file - 文件对象
 * @param {Object} options - 配置选项
 * @returns {Promise} 上传结果
 */
async function uploadSingleFile(file, options = {}) {
  const uploader = createFileUpload(options);
  uploader.addFiles([file]);
  
  return new Promise((resolve, reject) => {
    uploader.options.onComplete = (result) => {
      if (result.success > 0) {
        resolve(result.files[0]);
      } else {
        reject(new Error(result.files[0]?.error || '上传失败'));
      }
    };
    
    uploader.startUpload();
  });
}

/**
 * 快速批量上传文件
 * @param {FileList|Array} files - 文件列表
 * @param {Object} options - 配置选项
 * @returns {Promise} 上传结果
 */
async function uploadMultipleFiles(files, options = {}) {
  const uploader = createFileUpload(options);
  uploader.addFiles(files);
  
  return new Promise((resolve) => {
    uploader.options.onComplete = (result) => {
      resolve(result);
    };
    
    uploader.startUpload();
  });
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FileUploadManager,
    createFileUpload,
    uploadSingleFile,
    uploadMultipleFiles
  };
} else if (typeof window !== 'undefined') {
  window.FileUpload = {
    FileUploadManager,
    createFileUpload,
    uploadSingleFile,
    uploadMultipleFiles
  };
}