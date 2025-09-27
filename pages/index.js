import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

// 新的模块化导入
import { 
  createMessage, 
  createSuccessMessage, 
  createErrorMessage, 
  createWarningMessage,
  clearAllMessages 
} from '../components/ui/Message.js';
import { 
  createConfirmDialog, 
  createModal, 
  createLoadingModal 
} from '../components/ui/Modal.js';
import { 
  createProgressBar, 
  updateProgressBar, 
  createLoader 
} from '../components/ui/ProgressBar.js';
import { 
  getFileIcon, 
  formatFileSize, 
  generateFilePreview,
  isImageFile,
  isVideoFile,
  isAudioFile,
  downloadFile
} from '../utils/fileUtils.js';
import { 
  formatDate, 
  formatRelativeTime,
  formatBytes 
} from '../utils/formatUtils.js';
import { 
  copyToClipboard, 
  debounce, 
  generateUniqueId,
  AnimationUtils 
} from '../utils/commonUtils.js';
import { FileUploadManager, createFileUpload } from '../components/features/FileUpload/FileUpload.js';
import { FileBatchManager, createFileBatch } from '../components/features/FileBatch/FileBatch.js';
import { FilePreviewManager, createFilePreview } from '../components/features/FilePreview/FilePreview.js';
import { FILE_CONFIG, UI_CONFIG, API_CONFIG, UPLOAD_CONFIG } from '../constants/config.js';

// React Hooks 导入
import { 
  useFileUpload, 
  useFileManager, 
  useSearchDebounce, 
  useLocalStorage 
} from '../hooks';

// 保留原有组件导入
import { createFileCard } from '../components/common.js';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * TgNetBucket 主页面组件
 * 提供文件上传、下载、管理等功能
 */
export default function Home() {
  // 使用新的 Hook 管理状态
  const [viewMode, setViewMode] = useLocalStorage('fileViewMode', 'grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { debouncedSearchTerm } = useSearchDebounce(searchTerm, 300);
  
  // 文件预览状态
  const [showPreview, setShowPreview] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  
  // 文件过滤状态
  const [filterType, setFilterType] = useState('all');
  
  // 文件管理 Hook
  const {
    files,
    loading: filesLoading,
    selectedFiles,
    searchTerm: hookSearchTerm,
    sortBy,
    sortOrder,
    fetchFiles,
    deleteFile,
    deleteMultipleFiles,
    generateShortLink,
    toggleFileSelection,
    toggleSelectAll,
    setSearchTerm: setHookSearchTerm,
    setSortBy,
    setSortOrder,
    hasSelectedFiles,
    isAllSelected
  } = useFileManager();
  
  // 文件上传 Hook
  const {
    uploadQueue,
    isUploading,
    uploadProgress,
    uploadStats,
    isDragging,
    uploadFiles,
    uploadSingleFile,
    removeFromQueue,
    clearQueue,
    setIsDragging,
    setIsUploading,
    setUploadQueue,
    setUploadStats,
    setUploadProgress
  } = useFileUpload({
    onUploadSuccess: () => {
      fetchFiles(); // 刷新文件列表
    }
  });

  // 初始化模块化管理器（保留兼容性）
  const fileUploadManager = new FileUploadManager({
    apiEndpoint: '/api/files',
    maxFileSize: FILE_CONFIG.MAX_FILE_SIZE,
    allowedTypes: FILE_CONFIG.ALLOWED_TYPES,
    onProgress: (progress) => {},
    onSuccess: (result) => {
      createSuccessMessage(`文件 ${result.fileName} 上传成功！`);
      fetchFiles();
    },
    onError: (error) => createErrorMessage(`上传失败: ${error.message}`)
  });

  const fileBatchManager = new FileBatchManager({
    apiEndpoint: '/api/files',
    onBatchComplete: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      if (failCount === 0) {
        createSuccessMessage(`批量操作完成！成功处理 ${successCount} 个文件`);
      } else {
        createWarningMessage(`批量操作完成！成功 ${successCount} 个，失败 ${failCount} 个`);
      }
      fetchFiles();
    },
    onError: (error) => createErrorMessage(`批量操作失败: ${error.message}`)
  });

  const filePreviewManager = new FilePreviewManager({
    maxPreviewSize: FILE_CONFIG.MAX_PREVIEW_SIZE,
    supportedTypes: FILE_CONFIG.PREVIEW_TYPES,
    onError: (error) => createErrorMessage(`预览生成失败: ${error.message}`)
  });

  /**
   * 根据文件名获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型 ('image', 'document', 'video', 'audio', 'other')
   */
  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    return 'other';
  };

  // 使用新的模块化文件预览生成器
  const generateFilePreviewData = async (file) => {
    const preview = await filePreviewManager.generatePreview(file);
    return {
      id: generateUniqueId(),
      file: file,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      status: 'pending', // pending, uploading, completed, failed
      progress: 0,
      error: null,
      preview: preview
    };
  };

  // 处理多文件选择
  const handleMultipleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const previews = await Promise.all(files.map(generateFilePreviewData));
    
    setPreviewFiles(previews);
    setShowPreview(true);
    
    // 添加到上传队列
    setUploadQueue(prev => [...prev, ...previews]);
    setUploadStats(prev => ({
      ...prev,
      total: prev.total + previews.length
    }));
  };

  // 从预览中移除文件
  const removeFromPreview = (previewId) => {
    setPreviewFiles(prev => prev.filter(p => p.id !== previewId));
    setUploadQueue(prev => prev.filter(p => p.id !== previewId));
    setUploadStats(prev => ({
      ...prev,
      total: prev.total - 1
    }));
  };

  // 开始批量上传
  const startBatchUpload = async () => {
    if (uploadQueue.length === 0) return;
    
    setIsUploading(true);
    setShowPreview(false);
    
    for (const fileItem of uploadQueue) {
      if (fileItem.status === 'pending') {
        try {
          setUploadStats(prev => ({
            ...prev,
            current: fileItem.name
          }));
          
          // 更新文件状态为上传中
          setUploadQueue(prev => prev.map(item => 
            item.id === fileItem.id 
              ? { ...item, status: 'uploading' }
              : item
          ));
          
          await uploadSingleFile(fileItem);
          
          // 更新文件状态为完成
          setUploadQueue(prev => prev.map(item => 
            item.id === fileItem.id 
              ? { ...item, status: 'completed', progress: 100 }
              : item
          ));
          
          setUploadStats(prev => ({
            ...prev,
            completed: prev.completed + 1
          }));
          
        } catch (error) {
          // 更新文件状态为失败
          setUploadQueue(prev => prev.map(item => 
            item.id === fileItem.id 
              ? { ...item, status: 'failed', error: error.message }
              : item
          ));
          
          setUploadStats(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
        }
      }
    }
    
    setIsUploading(false);
    setUploadStats(prev => ({ ...prev, current: null }));
    
    // 刷新文件列表
    await fetchFiles();
    
    // 清理完成的上传
    setTimeout(() => {
      setUploadQueue([]);
      setUploadStats({ total: 0, completed: 0, failed: 0, current: null });
    }, 3000);
  };

  // 这些函数已经被 Hook 替代，移除重复代码

  // 上传文件处理函数 - 使用新的 Hook
  const handleFileUpload = async (file) => {
    if (!file) return;
    await uploadSingleFile(file);
  };

  // 批量操作功能已由 Hook 提供

  const handleSelectAll = () => {
    toggleSelectAll();
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) {
      createWarningMessage('请先选择要删除的文件');
      return;
    }

    await deleteSelectedFiles();
  };

  // 处理文件选择上传 - 使用新的 Hook
  const handleUpload = async (event) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    await uploadFiles(Array.from(fileList));
    
    // 清空文件输入
    event.target.value = '';
  };

  // 处理拖拽上传 - 使用新的 Hook
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
    
    const fileList = Array.from(e.dataTransfer.files);
    if (fileList.length === 0) return;

    await uploadFiles(fileList);
  };

  // 下载文件 - 使用新的 Hook
  const handleDownload = (fileId, fileName) => {
    downloadFile(fileId, fileName);
  };

  // 生成短链接 - 使用新的 Hook
  const handleGenerateShortLink = async (fileId, fileName) => {
    await generateShortLink(fileId);
  };

  // 删除文件 - 使用新的 Hook
  const handleDelete = async (messageId) => {
    await deleteFile(messageId);
  };



  // 使用防抖搜索功能
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm || '');
  }, [debouncedSearchTerm, setSearchTerm]);

  return (
    <div className="app">
      <Head>
        <title>TgNetBucket - 现代化文件存储</title>
        <meta name="description" content="基于Telegram的现代化文件存储服务" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles/globals.css" />
      </Head>

      <Header 
        onUpload={() => document.querySelector('input[type="file"]').click()}
        onRefresh={() => fetchFiles()}
      />

      <main className="main-content">
        {/* 英雄区域 */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">安全、快速的文件存储</h2>
            <p className="hero-description">
              基于Telegram的云存储服务，支持拖拽上传、一键分享、永久保存
            </p>
          </div>
        </section>

        {/* 上传区域 */}
        <section className="upload-section">
          <div className="upload-container">
            <div 
              className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
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
                  <h3 className="upload-title-text">拖拽文件到此处或点击上传</h3>
                  <p className="upload-description">支持所有文件类型，单文件最大50MB</p>
                </div>
                <button className="upload-select-button" onClick={() => document.querySelector('input[type="file"]').click()}>
                  <span>选择文件</span>
                </button>
                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </div>

              {uploadProgress > 0 && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}
            </div>


          </div>
        </section>

        {/* 文件预览模态框 */}
        {showPreview && (
          <div className="preview-modal">
            <div className="preview-content">
              <div className="preview-header">
                <h3>文件预览 ({previewFiles.length} 个文件)</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="preview-list">
                {previewFiles.map((fileItem) => (
                  <div key={fileItem.id} className="preview-item">
                    <div className="preview-thumbnail">
                      {fileItem.preview ? (
                        <img 
                      src={fileItem.preview} 
                      alt={fileItem.name}
                      loading="lazy"
                      decoding="async"
                    />
                      ) : (
                        <div className="file-type-icon">
                          {getFileIcon(fileItem.name)}
                        </div>
                      )}
                    </div>
                    
                    <div className="preview-info">
                      <h4 className="preview-name">{fileItem.name}</h4>
                      <p className="preview-size">{formatFileSize(fileItem.size)}</p>
                      <span className="preview-type">{fileItem.type}</span>
                    </div>
                    
                    <button
                      className="remove-btn"
                      onClick={() => removeFromPreview(fileItem.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="preview-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewFiles([]);
                    setUploadQueue([]);
                    setUploadStats({ total: 0, completed: 0, failed: 0, current: null });
                  }}
                >
                  取消
                </button>
                <button
                  className="upload-btn"
                  onClick={startBatchUpload}
                  disabled={previewFiles.length === 0}
                >
                  开始上传 ({previewFiles.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 上传队列状态 */}
        {(isUploading || uploadQueue.length > 0) && (
          <section className="upload-queue-section">
            <div className="queue-header">
              <h3>上传队列</h3>
              <div className="queue-stats">
                {uploadStats.total > 0 && (
                  <span>
                    {uploadStats.completed}/{uploadStats.total} 完成
                    {uploadStats.failed > 0 && `, ${uploadStats.failed} 失败`}
                  </span>
                )}
              </div>
            </div>
            
            {uploadStats.current && (
              <div className="current-upload">
                <p>正在上传: {uploadStats.current}</p>
              </div>
            )}
            
            <div className="queue-list">
              {uploadQueue.map((item) => (
                <div key={item.id} className={`queue-item ${item.status}`}>
                  <div className="queue-item-info">
                    <span className="queue-item-name">{item.name}</span>
                    <span className="queue-item-size">{formatFileSize(item.size)}</span>
                  </div>
                  
                  <div className="queue-item-status">
                    {item.status === 'pending' && <span className="status-pending">等待中</span>}
                    {item.status === 'uploading' && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{item.progress}%</span>
                      </div>
                    )}
                    {item.status === 'completed' && <span className="status-completed">✓ 完成</span>}
                    {item.status === 'failed' && (
                      <span className="status-failed" title={item.error}>✗ 失败</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 文件列表区域 */}
        <section className="files-section">
          <div className="section-header">
            <h2>📂 我的文件</h2>
            <div className="file-stats">
              共 {files.length} 个文件
            </div>
          </div>

          {/* 文件管理工具栏 */}
          <div className="file-toolbar">
            {/* 搜索框 */}
            <div className="search-container">
              <input
                type="text"
                placeholder="搜索文件名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            {/* 筛选和排序 */}
            <div className="filter-controls">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">所有类型</option>
                <option value="image">图片</option>
                <option value="document">文档</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
                <option value="other">其他</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="uploadTime">上传时间</option>
                <option value="fileName">文件名</option>
                <option value="fileSize">文件大小</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
                title={`当前: ${sortOrder === 'asc' ? '升序' : '降序'}`}
              >
                {sortOrder === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>

            {/* 视图模式切换 */}
            <div className="view-controls">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="网格视图"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="列表视图"
              >
                ☰
              </button>
            </div>
          </div>

          {/* 批量操作栏 */}
          {files.length > 0 && (
            <div className="batch-actions">
              <div className="batch-select">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === files.length && files.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark"></span>
                  全选 ({selectedFiles.length}/{files.length})
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="batch-buttons">
                  <button
                    onClick={handleBatchDelete}
                    className="batch-btn delete-btn"
                    disabled={isUploading}
                  >
                    <span className="btn-icon">🗑️</span>
                    删除选中 ({selectedFiles.length})
                  </button>
                  <button
                    onClick={() => setSelectedFiles(new Set())}
                    className="batch-btn cancel-btn"
                  >
                    取消选择
                  </button>
                </div>
              )}
            </div>
          )}

          {filesLoading && !uploadProgress && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          )}
          
          {!filesLoading && files.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>还没有文件</h3>
              <p>上传您的第一个文件开始使用吧！</p>
            </div>
          )}

          <div className={`file-container ${viewMode}`}>
              {files.map((file) => (
              <div key={file.fileId} className={`file-item ${selectedFiles.includes(file.fileId) ? 'selected' : ''}`}>
                {/* 选择框 */}
                <div className="file-select">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.fileId)}
                      onChange={() => toggleFileSelection(file.fileId)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>

                {/* 文件内容 */}
                <div className="file-content">
                  <div className="file-header">
                    <div className="file-icon">
                      {getFileIcon(file.fileName)}
                    </div>
                    <div className="file-info">
                      <h4 className="file-name" title={file.fileName}>
                        {file.fileName}
                      </h4>
                      <div className="file-meta">
                        <span className="file-type">{getFileType(file.fileName)}</span>
                        <span className="file-size">
                          {file.fileSize ? formatFileSize(file.fileSize) : '未知大小'}
                        </span>
                        <span className="file-date">
                          {file.uploadTime ? formatDate(file.uploadTime) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="file-actions">
                    <button
                      onClick={() => handleDownload(file.fileId, file.fileName)}
                      className="action-btn download-btn"
                      disabled={filesLoading}
                      title="下载文件"
                    >
                      <span className="btn-icon">⬇️</span>
                      <span className="btn-text">下载</span>
                    </button>
                    <button
                      onClick={() => handleGenerateShortLink(file.fileId, file.fileName)}
                      className="action-btn share-btn"
                      disabled={filesLoading}
                      title="生成分享链接"
                    >
                      <span className="btn-icon">🔗</span>
                      <span className="btn-text">分享</span>
                    </button>
                    <button
                      onClick={() => handleDelete(file.messageId)}
                      className="action-btn delete-btn"
                      disabled={filesLoading}
                      title="删除文件"
                    >
                      <span className="btn-icon">🗑️</span>
                      <span className="btn-text">删除</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />


    </div>
  );
}