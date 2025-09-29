import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FileUpload from '../components/features/FileUpload/FileUpload';
import FileBatch from '../components/features/FileBatch/FileBatch';
import FilePreview from '../components/features/FilePreview/FilePreview';
import PageAuthGuard from '../components/PageAuthGuard';
import AuthModal from '../components/AuthModal';
import DeleteQueueStatus from '../components/ui/DeleteQueueStatus';

// 导入自定义钩子
import { useFileList } from '../hooks/useFileList';
import { useFileUpload } from '../hooks/useFileUpload';
import { useBatchOps } from '../hooks/useBatchOps';

// 导入工具函数
import { getFileIcon, formatFileSize } from '../utils/fileUtils';
import { formatDate } from '../utils/formatUtils';
import { getFileType } from '../utils/validationUtils';

// 导入消息组件
import { createSuccessMessage, createErrorMessage } from '../components/ui/Message';

/**
 * TgNetBucket 主页面组件
 * 提供文件上传、下载、管理等功能
 */
export default function Home() {
  // 使用自定义钩子管理状态
  const {
    files,
    rawFiles,
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
    selectedCount,
    isProcessing,
    hasSelection,
    isAllSelected,
    isPartiallySelected,
    toggleFileSelection,
    toggleSelectAll,
    clearSelection,
    batchDelete,
    batchDownload,
    batchGenerateShortLinks
  } = useBatchOps(rawFiles, files, fetchFiles);

  // 视图模式状态

  const [previewFile, setPreviewFile] = useState(null);
  
  // 登录状态管理
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * 处理文件下载
   * @param {string} fileId - 文件ID
   * @param {string} fileName - 文件名
   */
  const handleDownload = async (fileId, fileName) => {
    try {
      // 生成短链接用于下载
      const result = await generateShortLink(fileId);
      if (result.success) {
        // 使用短链接进行下载
        window.open(result.shortLink, '_blank');
        createSuccessMessage(`文件 "${fileName}" 下载已开始`);
      } else {
        // 如果短链接生成失败，回退到直接下载
        window.open(`/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`, '_blank');
        createErrorMessage(result.error || '生成下载链接失败，已使用备用方式下载');
      }
    } catch (error) {
      console.error('下载失败:', error);
      // 出错时回退到直接下载
      window.open(`/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`, '_blank');
      createErrorMessage('下载链接生成失败，已使用备用方式下载');
    }
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

  /**
   * 显示登录弹窗
   */
  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  /**
   * 关闭登录弹窗
   */
  const handleCloseLogin = () => {
    setShowLoginModal(false);
  };

  /**
   * 登录成功处理
   */
  const handleLoginSuccess = () => {
    // 注意：当设置了redirectTo时，页面会立即跳转，此函数可能不会执行完成
    // 只在没有重定向时才关闭弹窗
    setShowLoginModal(false);
  };

  /**
   * 处理分享功能
   * @param {string} fileId - 文件ID
   */
  const handleShare = async (fileId) => {
    try {
      const result = await generateShortLink(fileId);
      if (result.success) {
        // 复制链接到剪贴板
        try {
          await navigator.clipboard.writeText(result.shortLink);
          createSuccessMessage(`分享链接已生成并复制到剪贴板：${result.shortLink}`);
        } catch {
          createSuccessMessage(`分享链接已生成：${result.shortLink}`);
        }
      } else {
        createErrorMessage(result.error || '生成分享链接失败');
      }
    } catch (error) {
      console.error('分享失败:', error);
      createErrorMessage('生成分享链接失败');
    }
  };

  // 文件列表初始化由 useFileList 钩子处理

  // files 已经是过滤和排序后的文件列表
  const filteredFiles = files;

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
        actions={[
          {
            key: 'login',
            icon: 'fas fa-sign-in-alt',
            text: '管理员登录',
            title: '登录到管理面板',
            onClick: handleShowLogin
          }
        ]}
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
            <h2><i className="fas fa-folder" /> 我的文件</h2>
            <div className="file-stats">
              共 {filteredFiles.length} 个文件
              {selectedFiles.length > 0 && (
                <span className="selected-stats">
                  ，已选择 {selectedFiles.length} 个文件 ({selectedTotalSizeFormatted})
                </span>
              )}
            </div>
          </div>

          {/* 文件管理工具栏 */}
          <div className="file-toolbar">
            {/* 批量操作组件 */}
            {selectedFiles.length > 0 && (
              <div className="batch-operations-container">
                <FileBatch
                  files={filteredFiles}
                  selectedFiles={selectedFiles}
                  selectedTotalSize={selectedTotalSize}
                  isProcessing={isProcessing}
                  onBatchDelete={() => batchDelete().then(handleBatchOperationComplete)}
                  onBatchDownload={batchDownload}
                  onBatchGenerateShortLinks={() => batchGenerateShortLinks().then(handleBatchOperationComplete)}
                  onClearSelection={clearSelection}
                  onSelectAll={toggleSelectAll}
                />
              </div>
            )}

            {/* 搜索框 */}
            <div className="search-container">
              <input
                type="text"
                placeholder="搜索文件名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <i className="fas fa-search search-icon" />
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
                <i className={`fas ${sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`} />
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>加载中...</p>
            </div>
          )}
          
          {!loading && filteredFiles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-folder-open" />
              </div>
              <h3>还没有文件</h3>
              <p>上传您的第一个文件开始使用吧！</p>
            </div>
          )}

          <div className="file-container list">
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
                      <i className={getFileIcon(file.fileName)} />
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
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                    title="下载文件"
                  >
                    <span className="btn-icon"><i className="fas fa-download" /></span>
                    <span className="btn-text">下载</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(file.fileId);
                    }}
                    className="btn btn-secondary btn-sm"
                    disabled={loading}
                    title="生成分享链接"
                  >
                    <span className="btn-icon"><i className="fas fa-share-alt" /></span>
                    <span className="btn-text">分享</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.messageId, file.fileName);
                    }}
                    className="btn btn-error btn-sm"
                    disabled={loading}
                    title="删除文件"
                  >
                    <span className="btn-icon"><i className="fas fa-trash" /></span>
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
            deleteFile(previewFile.messageId, previewFile.fileName);
            handleClosePreview();
          }}
          onGenerateShortLink={() => generateShortLink(previewFile.fileId)}
        />
      )}

      {/* 删除队列状态 */}
      <DeleteQueueStatus />

      {/* 登录弹窗 */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={handleCloseLogin}
        onSuccess={handleLoginSuccess}
        title="管理员登录"
        message="请输入管理员用户名和密码以访问管理面板"
        redirectTo="/admin"
      />

        <Footer />
      </div>
    </PageAuthGuard>
  );
}