/**
 * 文件上传React组件
 * 提供拖拽上传和点击上传功能
 */

import React, { useState, useRef } from 'react';
import axios from 'axios';
import AuthModal from '../../AuthModal';
import { getAuthStatus, requiresAuth } from '../../../utils/authUtils';

/**
 * 文件上传组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onUploadComplete - 上传完成回调
 * @param {Function} props.onUploadProgress - 上传进度回调
 * @param {Function} props.onUploadError - 上传错误回调
 * @param {boolean} props.multiple - 是否支持多文件上传
 * @param {string} props.accept - 接受的文件类型
 * @param {number} props.maxFileSize - 最大文件大小（字节）
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element} 文件上传组件
 */
const FileUpload = ({
  onUploadComplete,
  onUploadProgress,
  onUploadError,
  multiple = true,
  accept = "*/*",
  maxFileSize = 50 * 1024 * 1024, // 50MB
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * 验证文件
   * @param {File} file - 文件对象
   * @returns {boolean} 是否有效
   */
  const validateFile = (file) => {
    if (file.size > maxFileSize) {
      const errorMsg = `文件 "${file.name}" 大小超过限制 (${Math.round(maxFileSize / 1024 / 1024)}MB)`;
      if (onUploadError) {
        onUploadError(new Error(errorMsg));
      }
      return false;
    }
    return true;
  };

  /**
   * 上传单个文件
   * @param {File} file - 文件对象
   * @param {number} index - 文件索引
   * @param {number} total - 总文件数
   */
  const uploadSingleFile = async (file, index, total) => {
    if (!validateFile(file)) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const totalProgress = Math.round(((index + fileProgress / 100) * 100) / total);
          setUploadProgress(totalProgress);
          
          if (onUploadProgress) {
            onUploadProgress({
              fileProgress,
              totalProgress,
              fileName: file.name,
              fileIndex: index,
              totalFiles: total
            });
          }
        }
      });
    } catch (error) {
      console.error('上传失败:', error);
      if (onUploadError) {
        onUploadError(error, file);
      }
      throw error;
    }
  };

  /**
   * 检查认证状态并处理上传
   * @param {FileList} fileList - 文件列表
   */
  const checkAuthAndUpload = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    // 获取当前认证状态
    const authStatus = getAuthStatus();
    
    // 检查是否需要认证以及当前认证状态
    if (requiresAuth() && authStatus !== 'authenticated') {
      // 保存待上传的文件，显示认证弹窗
      setPendingFiles(fileList);
      setShowAuthModal(true);
      return;
    }

    // 已认证，直接上传
    handleUpload(fileList);
  };

  /**
   * 处理文件上传
   * @param {FileList} fileList - 文件列表
   */
  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const files = Array.from(fileList);
      
      for (let i = 0; i < files.length; i++) {
        await uploadSingleFile(files[i], i, files.length);
      }

      if (onUploadComplete) {
        onUploadComplete(files);
      }
    } catch (error) {
      console.error('批量上传失败:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * 处理认证成功
   */
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingFiles) {
      handleUpload(pendingFiles);
      setPendingFiles(null);
    }
  };

  /**
   * 处理认证弹窗关闭
   */
  const handleAuthClose = () => {
    setShowAuthModal(false);
    setPendingFiles(null);
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event) => {
    checkAuthAndUpload(event.target.files);
  };

  /**
   * 处理拖拽事件
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const fileList = e.dataTransfer.files;
    checkAuthAndUpload(fileList);
  };

  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className={`upload-section ${className}`}>
        <div className="upload-container">
          <div 
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <div className="upload-content">
              <div className="upload-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div className="upload-text-content">
                <h3 className="upload-title-text">
                  {isUploading ? '上传中...' : '拖拽文件到此处或点击上传'}
                </h3>
                <p className="upload-description">
                  支持所有文件类型，单文件最大{Math.round(maxFileSize / 1024 / 1024)}MB
                </p>
              </div>
              <button 
                className="upload-select-button" 
                onClick={triggerFileSelect}
                disabled={isUploading}
                type="button"
              >
                <span>{isUploading ? '上传中...' : '选择文件'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileSelect}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </div>
            
            {/* 上传进度条 */}
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="progress-text">
                  {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 认证弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        title="上传文件需要认证"
        message="请输入管理员用户名和密码以继续上传文件"
      />
    </>
  );
};

export default FileUpload;