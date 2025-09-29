/**
 * 文件预览React组件
 * 提供多种文件类型的预览功能
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';

/**
 * 文件预览组件
 * @param {Object} props - 组件属性
 * @param {Object} props.file - 文件对象
 * @param {boolean} props.isOpen - 是否打开预览
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onError - 错误回调
 * @param {Function} props.onDownload - 下载回调
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element} 文件预览组件
 */
const FilePreview = ({
  file,
  isOpen = false,
  onClose,
  onError,
  onDownload,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  /**
   * 获取文件类型
   * @param {string} fileName - 文件名
   * @param {string} mimeType - MIME类型
   * @returns {string} 文件类型
   */
  const getFileType = (fileName, mimeType) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    // 图片类型
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext) || 
        mimeType?.startsWith('image/')) {
      return 'image';
    }
    
    // 视频类型
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext) || 
        mimeType?.startsWith('video/')) {
      return 'video';
    }
    
    // 音频类型
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) || 
        mimeType?.startsWith('audio/')) {
      return 'audio';
    }
    
    // 文本类型
    if (['txt', 'md', 'json', 'xml', 'csv', 'log', 'js', 'css', 'html', 'py', 'java', 'cpp', 'c'].includes(ext) || 
        mimeType?.startsWith('text/')) {
      return 'text';
    }
    
    // PDF类型
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    // 代码类型
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(ext)) {
      return 'code';
    }
    
    return 'unsupported';
  };

  /**
   * 加载预览内容
   */
  const loadPreviewContent = useCallback(async () => {
    if (!file || !isOpen) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewContent(null);

    try {
      const fileType = getFileType(file.name, file.mimeType);
      setPreviewType(fileType);

      switch (fileType) {
        case 'image':
          setPreviewContent(`/api/files/${file.id}/download`);
          break;

        case 'video':
        case 'audio':
          setPreviewContent(`/api/files/${file.id}/download`);
          break;

        case 'text':
        case 'code':
          const textResponse = await axios.get(`/api/files/${file.id}/content`, {
            responseType: 'text'
          });
          setPreviewContent(textResponse.data);
          break;

        case 'pdf':
          setPreviewContent(`/api/files/${file.id}/download`);
          break;

        default:
          setPreviewType('unsupported');
          break;
      }
    } catch (error) {
      console.error('加载预览内容失败:', error);
      setError('预览加载失败');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [file, isOpen, onError]);

  /**
   * 处理下载
   */
  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      window.open(`/api/files/${file.id}/download`, '_blank');
    }
  };

  /**
   * 处理关闭
   */
  const handleClose = useCallback(() => {
    setPreviewContent(null);
    setError(null);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  /**
   * 处理模态框点击
   */
  const handleModalClick = (e) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  /**
   * 渲染预览内容
   */
  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="preview-loading">
          <div className="loading-container" />
          <div className="loading-spinner" />
          <p>加载中...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="preview-error">
          <div className="error-icon"><i className="fas fa-exclamation-triangle" /></div>
          <p>{error}</p>
          <button onClick={handleDownload} className="download-btn">
            下载文件
          </button>
        </div>
      );
    }

    switch (previewType) {
      case 'image':
        return (
          <div className="preview-image">
            <div className="image-interactive">
              <Image 
                src={previewContent} 
                alt={file.name}
                width={800}
                height={600}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                onError={() => setError('图片加载失败')}
              />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="preview-video">
            <video 
              controls 
              src={previewContent}
              onError={() => setError('视频加载失败')}
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="preview-audio">
            <audio 
              controls 
              src={previewContent}
              onError={() => setError('音频加载失败')}
            >
              您的浏览器不支持音频播放
            </audio>
            <div className="audio-info">
              <h3>{file.name}</h3>
              <p>大小: {formatFileSize(file.size)}</p>
            </div>
          </div>
        );

      case 'text':
      case 'code':
        return (
          <div className="preview-text">
            <pre className={`code-content ${previewType === 'code' ? 'code-highlight' : ''}`}>
              {previewContent}
            </pre>
          </div>
        );

      case 'pdf':
        return (
          <div className="preview-pdf">
            <iframe 
              src={previewContent}
              title={file.name}
              onError={() => setError('PDF加载失败')}
            />
          </div>
        );

      case 'unsupported':
      default:
        return (
          <div className="preview-unsupported">
            <div className="unsupported-icon"><i className="fas fa-file" /></div>
            <h3>不支持预览此文件类型</h3>
            <p>文件: {file.name}</p>
            <p>大小: {formatFileSize(file.size)}</p>
            <button onClick={handleDownload} className="download-btn">
              下载文件
            </button>
          </div>
        );
    }
  };

  // 监听文件变化，重新加载预览
  useEffect(() => {
    if (isOpen && file) {
      loadPreviewContent();
    }
  }, [file, isOpen, loadPreviewContent]);

  // 监听键盘事件
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !file) {
    return null;
  }

  return (
    <div 
      className={`file-preview-modal ${className}`}
      ref={modalRef}
      onClick={handleModalClick}
    >
      <div className="preview-container">
        {/* 预览头部 */}
        <div className="preview-header">
          <div className="file-info">
            <h2 className="file-name">{file.name}</h2>
            <div className="file-meta">
              <span className="file-size">{formatFileSize(file.size)}</span>
              {file.mimeType && (
                <span className="file-type">{file.mimeType}</span>
              )}
            </div>
          </div>
          
          <div className="preview-actions">
            <button 
              onClick={handleDownload}
              className="action-btn download-btn"
              title="下载"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            
            <button 
              onClick={handleClose}
              className="action-btn close-btn"
              title="关闭"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 预览内容 */}
        <div className="preview-content">
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;