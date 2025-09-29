/**
 * 文件批量操作React组件
 * 提供批量选择、删除、下载等功能
 */

import React, { useState, useCallback } from 'react';

/**
 * 文件批量操作组件
 * @param {Object} props - 组件属性
 * @param {Array} props.files - 文件列表
 * @param {Array} props.selectedFiles - 已选择的文件ID列表
 * @param {number} props.selectedTotalSize - 已选择文件的总大小
 * @param {boolean} props.isProcessing - 是否正在处理
 * @param {Function} props.onBatchDelete - 批量删除回调
 * @param {Function} props.onBatchDownload - 批量下载回调
 * @param {Function} props.onBatchGenerateShortLinks - 批量生成短链接回调
 * @param {Function} props.onClearSelection - 清空选择回调
 * @param {Function} props.onSelectAll - 全选回调
 * @param {Function} props.onError - 错误处理回调
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element} 文件批量操作组件
 */
const FileBatch = ({
  files = [],
  selectedFiles = [],
  selectedTotalSize = 0,
  isProcessing = false,
  onBatchDelete,
  onBatchDownload,
  onBatchGenerateShortLinks,
  onClearSelection,
  onSelectAll,
  onError,
  disabled = false,
  className = ''
}) => {
  // 当前操作类型，用于显示不同的加载状态
  const [operationType, setOperationType] = useState('');

  /**
   * 处理全选/取消全选
   */
  const handleSelectAll = useCallback(() => {
    if (onSelectAll) {
      onSelectAll();
    }
  }, [onSelectAll]);

  /**
   * 清空选择
   */
  const clearSelection = useCallback(() => {
    if (onClearSelection) {
      onClearSelection();
    }
  }, [onClearSelection]);

  /**
   * 批量删除文件
   */
  const handleBatchDelete = useCallback(async () => {
    if (onBatchDelete) {
      try {
        setOperationType('delete');
        await onBatchDelete();
      } catch (error) {
        if (onError) {
          onError(error);
        }
      } finally {
        setOperationType('');
      }
    }
  }, [onBatchDelete, onError]);

  /**
   * 批量下载文件
   */
  const handleBatchDownload = useCallback(async () => {
    if (onBatchDownload) {
      try {
        setOperationType('download');
        await onBatchDownload();
      } catch (error) {
        if (onError) {
          onError(error);
        }
      } finally {
        setOperationType('');
      }
    }
  }, [onBatchDownload, onError]);

  /**
   * 批量生成短链接
   */
  const handleBatchGenerateShortLinks = useCallback(async () => {
    if (onBatchGenerateShortLinks) {
      try {
        setOperationType('shortlink');
        await onBatchGenerateShortLinks();
      } catch (error) {
        if (onError) {
          onError(error);
        }
      } finally {
        setOperationType('');
      }
    }
  }, [onBatchGenerateShortLinks, onError]);

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

  const selectedCount = selectedFiles.length;
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
                if (input) {
                  input.indeterminate = isPartialSelected;
                }
              }}
              onChange={handleSelectAll}
              disabled={disabled || isProcessing}
            />
            <span className="checkmark" />
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
                总大小: {formatFileSize(selectedTotalSize)}
              </span>
              <button
                className="btn btn-sm btn-ghost"
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
              className="btn btn-primary btn-sm"
              onClick={handleBatchDownload}
              disabled={disabled || isProcessing}
              type="button"
            >
              {isProcessing && operationType === 'download' ? (
                <>
                  <span className="loading-spinner" />
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
              className="btn btn-secondary btn-sm"
              onClick={handleBatchGenerateShortLinks}
              disabled={disabled || isProcessing}
              type="button"
            >
              {isProcessing && operationType === 'shortlink' ? (
                <>
                  <span className="loading-spinner" />
                  生成中...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  短链接 ({selectedCount})
                </>
              )}
            </button>
            
            <button
              className="btn btn-error btn-sm"
              onClick={handleBatchDelete}
              disabled={disabled || isProcessing}
              type="button"
            >
              {isProcessing && operationType === 'delete' ? (
                <>
                  <span className="loading-spinner" />
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
            <div className="batch-actions-divider" />
          </div>
        )}
      </div>


    </div>
  );
};

export default FileBatch;