/**
 * 文件批量操作React组件
 * 提供批量选择、删除、下载等功能
 */

import React, { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * 文件批量操作组件
 * @param {Object} props - 组件属性
 * @param {Array} props.files - 文件列表
 * @param {Function} props.onSelectionChange - 选择变化回调
 * @param {Function} props.onBatchDelete - 批量删除回调
 * @param {Function} props.onBatchDownload - 批量下载回调
 * @param {Function} props.onError - 错误回调
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element} 文件批量操作组件
 */
const FileBatch = ({
  files = [],
  onSelectionChange,
  onBatchDelete,
  onBatchDownload,
  onError,
  disabled = false,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationType, setOperationType] = useState('');

  /**
   * 处理单个文件选择
   * @param {string} fileId - 文件ID
   * @param {boolean} isSelected - 是否选中
   */
  const handleFileSelect = useCallback((fileId, isSelected) => {
    const newSelection = new Set(selectedFiles);
    
    if (isSelected) {
      newSelection.add(fileId);
    } else {
      newSelection.delete(fileId);
    }
    
    setSelectedFiles(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  }, [selectedFiles, onSelectionChange]);

  /**
   * 处理全选/取消全选
   */
  const handleSelectAll = useCallback(() => {
    const allFileIds = files.map(file => file.id);
    const isAllSelected = allFileIds.every(id => selectedFiles.has(id));
    
    let newSelection;
    if (isAllSelected) {
      newSelection = new Set();
    } else {
      newSelection = new Set(allFileIds);
    }
    
    setSelectedFiles(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  }, [files, selectedFiles, onSelectionChange]);

  /**
   * 清空选择
   */
  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
    
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  /**
   * 批量删除文件
   */
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      if (onError) {
        onError(new Error('请先选择要删除的文件'));
      }
      return;
    }

    const confirmed = window.confirm(`确定要删除选中的 ${selectedFiles.size} 个文件吗？此操作不可恢复。`);
    if (!confirmed) return;

    setIsProcessing(true);
    setOperationType('delete');

    try {
      const selectedFileIds = Array.from(selectedFiles);
      const deletePromises = selectedFileIds.map(fileId => 
        axios.delete(`/api/files/${fileId}`)
      );

      await Promise.all(deletePromises);

      // 清空选择
      clearSelection();

      if (onBatchDelete) {
        onBatchDelete(selectedFileIds);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
      setOperationType('');
    }
  };

  /**
   * 批量下载文件
   */
  const handleBatchDownload = async () => {
    if (selectedFiles.size === 0) {
      if (onError) {
        onError(new Error('请先选择要下载的文件'));
      }
      return;
    }

    setIsProcessing(true);
    setOperationType('download');

    try {
      const selectedFileIds = Array.from(selectedFiles);
      
      if (selectedFileIds.length === 1) {
        // 单文件直接下载
        const fileId = selectedFileIds[0];
        const file = files.find(f => f.id === fileId);
        if (file) {
          window.open(`/api/files/${fileId}/download`, '_blank');
        }
      } else {
        // 多文件打包下载
        const response = await axios.post('/api/files/batch-download', {
          fileIds: selectedFileIds
        }, {
          responseType: 'blob'
        });

        // 创建下载链接
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `batch_download_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      if (onBatchDownload) {
        onBatchDownload(selectedFileIds);
      }
    } catch (error) {
      console.error('批量下载失败:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
      setOperationType('');
    }
  };

  /**
   * 获取选中文件的总大小
   */
  const getSelectedSize = useCallback(() => {
    return Array.from(selectedFiles).reduce((total, fileId) => {
      const file = files.find(f => f.id === fileId);
      return total + (file ? file.size : 0);
    }, 0);
  }, [selectedFiles, files]);

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedCount = selectedFiles.size;
  const totalCount = files.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className={`batch-operations ${className}`}>
      {/* 批量操作工具栏 */}
      <div className="batch-toolbar">
        <div className="batch-selection">
          <label className="batch-checkbox">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isPartialSelected;
              }}
              onChange={handleSelectAll}
              disabled={disabled || isProcessing}
            />
            <span className="checkmark"></span>
            <span className="selection-text">
              {selectedCount > 0 
                ? `已选择 ${selectedCount} / ${totalCount} 个文件`
                : `全选 (${totalCount} 个文件)`
              }
            </span>
          </label>
          
          {selectedCount > 0 && (
            <div className="selection-info">
              <span className="selected-size">
                总大小: {formatFileSize(getSelectedSize())}
              </span>
              <button
                className="clear-selection"
                onClick={clearSelection}
                disabled={disabled || isProcessing}
                type="button"
              >
                清空选择
              </button>
            </div>
          )}
        </div>

        {/* 批量操作按钮 */}
        {selectedCount > 0 && (
          <div className="batch-actions">
            <button
              className="batch-download-btn"
              onClick={handleBatchDownload}
              disabled={disabled || isProcessing}
              type="button"
            >
              {isProcessing && operationType === 'download' ? (
                <>
                  <span className="loading-spinner"></span>
                  下载中...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  下载 ({selectedCount})
                </>
              )}
            </button>
            
            <button
              className="batch-delete-btn"
              onClick={handleBatchDelete}
              disabled={disabled || isProcessing}
              type="button"
            >
              {isProcessing && operationType === 'delete' ? (
                <>
                  <span className="loading-spinner"></span>
                  删除中...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  删除 ({selectedCount})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 文件选择器 */}
      <div className="file-selection-list">
        {files.map(file => (
          <div key={file.id} className="file-selection-item">
            <label className="file-checkbox">
              <input
                type="checkbox"
                checked={selectedFiles.has(file.id)}
                onChange={(e) => handleFileSelect(file.id, e.target.checked)}
                disabled={disabled || isProcessing}
              />
              <span className="checkmark"></span>
              <span className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileBatch;