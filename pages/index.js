import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FileUpload from '../components/features/FileUpload/FileUpload';
import FileBatch from '../components/features/FileBatch/FileBatch';
import FilePreview from '../components/features/FilePreview/FilePreview';
import PageAuthGuard from '../components/PageAuthGuard';

// 导入自定义钩子
import { useFileList } from '../hooks/useFileList';
import { useFileUpload } from '../hooks/useFileUpload';
import { useBatchOps } from '../hooks/useBatchOps';

// 导入工具函数
import { getFileIcon, formatFileSize } from '../utils/fileUtils';
import { formatDate } from '../utils/formatUtils';
import { getFileType } from '../utils/validationUtils';

/**
 * TgNetBucket 主页面组件
 * 提供文件上传、下载、管理等功能
 */
export default function Home() {
  // 使用自定义钩子管理状态
  const {
    files,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    fetchFiles,
    deleteFile,
    generateShortLink
  } = useFileList();

  const {
    uploadProgress,
    isUploading,
    isDragging,
    handleUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useFileUpload({
    onUploadComplete: fetchFiles
  });

  const {
    selectedFiles,
    selectedTotalSize,
    selectedTotalSizeFormatted,
    isProcessing,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    batchDelete,
    batchDownload,
    batchGenerateShortLinks
  } = useBatchOps(files);

  // 视图模式状态
  const [viewMode, setViewMode] = useState('grid');
  const [previewFile, setPreviewFile] = useState(null);

  /**
   * 处理文件下载
   * @param {string} fileId - 文件ID
   * @param {string} fileName - 文件名
   */
  const handleDownload = (fileId, fileName) => {
    window.open(`/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`, '_blank');
  };

  /**
   * 处理文件预览
   * @param {Object} file - 文件对象
   */
  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  /**
   * 关闭文件预览
   */
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  /**
   * 处理批量操作完成
   */
  const handleBatchOperationComplete = () => {
    fetchFiles();
    clearSelection();
  };

  // 初始化加载文件列表
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // 过滤和排序文件
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || getFileType(file.fileName) === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'fileSize':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        default:
          aValue = new Date(a.uploadTime || 0);
          bValue = new Date(b.uploadTime || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <PageAuthGuard>
      <div className="app">
        <Head>
          <title>TgNetBucket - 现代化文件存储</title>
          <meta name="description" content="基于Telegram的现代化文件存储服务" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

      <Header 
        onUpload={() => document.querySelector('input[type="file"]').click()}
        onRefresh={fetchFiles}
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

        {/* 文件上传组件 */}
        <FileUpload
          onUpload={handleUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          isDragging={isDragging}
        />

        {/* 文件列表区域 */}
        <section className="files-section">
          <div className="section-header">
            <h2>📂 我的文件</h2>
            <div className="file-stats">
              共 {filteredFiles.length} 个文件
              {selectedFiles.length > 0 && (
                <span className="selected-stats">
                  ，已选择 {selectedFiles.length} 个文件 ({selectedTotalSizeFormatted})
                </span>
              )}
            </div>
          </div>

          {/* 批量操作组件 */}
          {selectedFiles.length > 0 && (
            <FileBatch
              selectedFiles={selectedFiles}
              selectedTotalSize={selectedTotalSize}
              isProcessing={isProcessing}
              onBatchDelete={() => batchDelete().then(handleBatchOperationComplete)}
              onBatchDownload={batchDownload}
              onBatchGenerateShortLinks={() => batchGenerateShortLinks().then(handleBatchOperationComplete)}
              onClearSelection={clearSelection}
              onSelectAll={() => selectAllFiles(filteredFiles)}
            />
          )}

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
              <i className="fas fa-search search-icon"></i>
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

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          )}
          
          {!loading && filteredFiles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-folder-open"></i>
              </div>
              <h3>还没有文件</h3>
              <p>上传您的第一个文件开始使用吧！</p>
            </div>
          )}

          <div className={`file-container ${viewMode}`}>
            {filteredFiles.map((file) => (
              <div key={file.fileId} className="file-item">
                {/* 文件选择复选框 */}
                <div className="file-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.fileId)}
                    onChange={() => toggleFileSelection(file.fileId, file.fileSize)}
                  />
                </div>

                {/* 文件内容 */}
                <div className="file-content" onClick={() => handlePreview(file)}>
                  <div className="file-header">
                    <div className="file-icon">
                      <i className={getFileIcon(file.fileName)}></i>
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
                </div>
                
                <div className="file-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file.fileId, file.fileName);
                    }}
                    className="action-btn download-btn"
                    disabled={loading}
                    title="下载文件"
                  >
                    <span className="btn-icon">⬇️</span>
                    <span className="btn-text">下载</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateShortLink(file.fileId);
                    }}
                    className="action-btn share-btn"
                    disabled={loading}
                    title="生成分享链接"
                  >
                    <span className="btn-icon">🔗</span>
                    <span className="btn-text">分享</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.messageId);
                    }}
                    className="action-btn delete-btn"
                    disabled={loading}
                    title="删除文件"
                  >
                    <span className="btn-icon">🗑️</span>
                    <span className="btn-text">删除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 文件预览组件 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={handleClosePreview}
          onDownload={() => handleDownload(previewFile.fileId, previewFile.fileName)}
          onDelete={() => {
            deleteFile(previewFile.messageId);
            handleClosePreview();
          }}
          onGenerateShortLink={() => generateShortLink(previewFile.fileId)}
        />
      )}

        <Footer />
      </div>
    </PageAuthGuard>
  );
}