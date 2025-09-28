/**
 * 文件卡片组件
 * 用于显示文件信息和操作按钮的React组件
 */

import React from 'react';
import { getFileIcon, formatFileSize } from '../../utils/fileUtils';
import { formatDate } from '../../utils/formatUtils';

/**
 * 文件卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.file - 文件对象
 * @param {Function} props.onPreview - 预览文件回调
 * @param {Function} props.onDownload - 下载文件回调
 * @param {Function} props.onCopyLink - 复制链接回调
 * @param {Function} props.onDelete - 删除文件回调
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element} 文件卡片组件
 */
const FileCard = ({ 
  file, 
  onPreview, 
  onDownload, 
  onCopyLink, 
  onDelete,
  className = ''
}) => {
  /**
   * 处理预览点击
   */
  const handlePreview = () => {
    if (onPreview) {
      onPreview(file.id, file);
    }
  };

  /**
   * 处理下载点击
   */
  const handleDownload = () => {
    if (onDownload) {
      onDownload(file.id, file);
    }
  };

  /**
   * 处理复制链接点击
   */
  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink(file.id, file);
    }
  };

  /**
   * 处理删除点击
   */
  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.id, file);
    }
  };

  return (
    <div className={`file-card ${className}`}>
      <div className="file-icon">
        {getFileIcon(file.name)}
      </div>
      
      <div className="file-info">
        <div className="file-name" title={file.name}>
          {file.name}
        </div>
        <div className="file-meta">
          <span className="file-size">
            {formatFileSize(file.size)}
          </span>
          <span className="file-date">
            {formatDate(file.uploadTime)}
          </span>
        </div>
      </div>
      
      <div className="file-actions">
        <button 
          className="btn-icon" 
          onClick={handlePreview}
          title="预览"
          type="button"
        >
          👁️
        </button>
        <button 
          className="btn-icon" 
          onClick={handleDownload}
          title="下载"
          type="button"
        >
          📥
        </button>
        <button 
          className="btn-icon" 
          onClick={handleCopyLink}
          title="复制链接"
          type="button"
        >
          🔗
        </button>
        <button 
          className="btn-icon btn-danger" 
          onClick={handleDelete}
          title="删除"
          type="button"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default FileCard;