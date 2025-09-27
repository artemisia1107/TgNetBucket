/**
 * 文件上传 Hook
 * 提供文件上传的状态管理和业务逻辑
 */
import { useState, useCallback } from 'react';
import axios from 'axios';
import { createSuccessMessage, createErrorMessage } from '../components/ui/Message';
import { FILE_CONFIG } from '../constants/config';

/**
 * 文件上传 Hook
 * @returns {Object} 上传状态和方法
 */
export function useFileUpload(options = {}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadStats, setUploadStats] = useState({ total: 0, completed: 0, failed: 0, current: null });
  const [isDragging, setIsDragging] = useState(false);
  
  const { onUploadSuccess } = options;

  /**
   * 验证文件
   * @param {File} file - 要验证的文件
   * @returns {boolean} 是否通过验证
   */
  const validateFile = useCallback((file) => {
    // 检查文件大小
    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
      createErrorMessage(`文件大小不能超过 ${FILE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
      return false;
    }

    // 检查文件类型
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!FILE_CONFIG.ALLOWED_TYPES.includes(fileExtension)) {
      createErrorMessage(`不支持的文件类型: ${fileExtension}`);
      return false;
    }

    return true;
  }, []);

  /**
   * 上传单个文件
   * @param {File} file - 要上传的文件
   * @returns {Promise<Object>} 上传结果
   */
  const uploadFile = useCallback(async (file) => {
    if (!validateFile(file)) {
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        const uploadedFile = response.data.data;
        setUploadedFiles(prev => [...prev, uploadedFile]);
        createSuccessMessage(`文件 "${file.name}" 上传成功`);
        return uploadedFile;
      } else {
        throw new Error(response.data.error || '上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      createErrorMessage(`文件上传失败: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateFile]);

  /**
   * 批量上传文件
   * @param {FileList} files - 要上传的文件列表
   * @returns {Promise<Array>} 上传结果数组
   */
  const uploadMultipleFiles = useCallback(async (files) => {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadFile(file);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }, [uploadFile]);

  /**
   * 上传单个文件（队列项）
   * @param {Object} fileItem - 文件项对象
   * @returns {Promise<Object>} 上传结果
   */
  const uploadSingleFile = useCallback(async (fileItem) => {
    try {
      // 更新上传状态为进行中
      setUploadQueue(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'uploading' }
          : item
      ));

      const result = await uploadFile(fileItem.file);
      
      if (result && onUploadSuccess) {
        onUploadSuccess(result);
      }

      return result;
    } catch (error) {
      // 更新上传状态为失败
      setUploadQueue(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'failed', error: error.message }
          : item
      ));
      throw error;
    }
  }, [uploadFile, onUploadSuccess]);

  /**
   * 从队列中移除文件
   * @param {string} fileId - 文件ID
   */
  const removeFromQueue = useCallback((fileId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== fileId));
  }, []);

  /**
   * 清空上传队列
   */
  const clearQueue = useCallback(() => {
    setUploadQueue([]);
    setUploadStats({ total: 0, completed: 0, failed: 0, current: null });
  }, []);

  /**
   * 批量上传文件
   * @param {FileList|Array} files - 文件列表
   */
  const uploadFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const previews = fileArray.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0
    }));
    
    setUploadQueue(prev => [...prev, ...previews]);
    setUploadStats(prev => ({
      ...prev,
      total: prev.total + previews.length
    }));
  }, []);

  /**
   * 重置上传状态
   */
  const resetUpload = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedFiles([]);
    setUploadQueue([]);
    setUploadStats({ total: 0, completed: 0, failed: 0, current: null });
  }, []);

  return {
    // 状态
    uploadProgress,
    isUploading,
    uploadedFiles,
    uploadQueue,
    uploadStats,
    isDragging,
    
    // 方法
    uploadFile,
    uploadSingleFile,
    uploadMultipleFiles,
    uploadFiles,
    removeFromQueue,
    clearQueue,
    validateFile,
    resetUpload,
    
    // Setter 函数
    setIsDragging,
    setIsUploading,
    setUploadQueue,
    setUploadStats,
    setUploadProgress,
  };
}