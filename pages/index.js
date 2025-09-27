import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { 
  createMessage, 
  createLoader, 
  createConfirmDialog, 
  createProgressBar, 
  updateProgressBar,
  createFileCard,
  getFileIcon,
  formatFileSize,
  formatDate,
  copyToClipboard,
  debounce,
  AnimationUtils
} from '../components/common.js';

/**
 * TgNetBucket 主页面组件
 * 提供文件上传、下载、管理等功能
 */
export default function Home() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // 文件管理状态
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadTime'); // uploadTime, fileName, fileSize
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [filterType, setFilterType] = useState('all'); // all, image, document, video, audio, other
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  
  // 上传队列相关状态
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    current: null
  });
  
  // 文件预览相关状态
  const [previewFiles, setPreviewFiles] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // 获取文件类型
  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    return 'other';
  };

  // 生成文件预览
  const generateFilePreview = (file) => {
    return new Promise((resolve) => {
      const fileType = getFileType(file.name);
      const preview = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: fileType,
        status: 'pending', // pending, uploading, completed, failed
        progress: 0,
        error: null,
        preview: null
      };

      if (fileType === 'image' && file.size < 10 * 1024 * 1024) { // 10MB limit for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.preview = e.target.result;
          resolve(preview);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(preview);
      }
    });
  };

  // 处理多文件选择
  const handleMultipleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const previews = await Promise.all(files.map(generateFilePreview));
    
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

  // 上传单个文件
  const uploadSingleFile = async (fileItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadQueue(prev => prev.map(item => 
          item.id === fileItem.id 
            ? { ...item, progress }
            : item
        ));
      },
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.error || '上传失败');
    }
  };

  // 过滤和排序文件
  const filterAndSortFiles = (fileList) => {
    let filtered = [...fileList];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(file => getFileType(file.fileName) === filterType);
    }

    // 排序
    filtered.sort((a, b) => {
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
        case 'uploadTime':
        default:
          aValue = new Date(a.uploadTime || 0);
          bValue = new Date(b.uploadTime || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // 获取文件列表
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/files');
      const fileList = response.data.files || [];
      setFiles(fileList);
      setFilteredFiles(filterAndSortFiles(fileList));
    } catch (error) {
      createMessage(`获取文件列表失败: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 上传文件处理函数
  const uploadFile = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    
    // 使用公共组件显示消息
    createMessage('正在上传文件...', 'info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      createMessage('文件上传成功！', 'success');
      fetchFiles(); // 刷新文件列表
    } catch (error) {
      createMessage(`文件上传失败: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // 批量操作功能
  const toggleFileSelection = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(file => file.fileId)));
    }
  };

  const batchDeleteFiles = async () => {
    if (selectedFiles.size === 0) {
      createMessage('请先选择要删除的文件', 'warning');
      return;
    }

    createConfirmDialog(
      `确定要删除选中的 ${selectedFiles.size} 个文件吗？此操作无法撤销。`,
      async () => {
        setIsLoading(true);
        try {
          const deletePromises = Array.from(selectedFiles).map(fileId => {
            const file = files.find(f => f.fileId === fileId);
            return axios.delete(`/api/files?messageId=${file.messageId}`);
          });
          
          await Promise.all(deletePromises);
          createMessage(`成功删除 ${selectedFiles.size} 个文件！`, 'success');
          setSelectedFiles(new Set());
          fetchFiles();
        } catch (error) {
          createMessage(`批量删除失败: ${error.message}`, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // 处理文件选择上传
  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // 单文件上传，保持原有逻辑
      const file = files[0];
      await uploadFile(file);
    } else {
      // 多文件上传，使用新的队列系统
      await handleMultipleFiles(files);
    }
    
    // 清空文件输入
    event.target.value = '';
  };

  // 处理拖拽上传
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
    const files = e.dataTransfer.files;
    
    if (files.length === 1) {
      // 单文件上传
      const file = files[0];
      await uploadFile(file);
    } else if (files.length > 1) {
      // 多文件上传
      await handleMultipleFiles(files);
    }
  };

  // 下载文件
  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `/api/download?fileId=${fileId}`;
    
    // 创建一个临时的a标签来触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 生成短链接
  const handleGenerateShortLink = async (fileId, fileName) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/short-link', {
        fileId: fileId,
        expiresIn: 3600 // 1小时过期
      });
      
      if (response.data.success) {
        const shortUrl = response.data.shortUrl;
        
        // 使用公共组件复制到剪贴板
        const success = await copyToClipboard(shortUrl);
        if (success) {
          createMessage(`短链接已生成并复制到剪贴板: ${shortUrl}`, 'success');
        } else {
          createMessage(`短链接已生成: ${shortUrl}`, 'info');
        }
      }
    } catch (error) {
      createMessage(`生成短链接失败: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文件
  const handleDelete = async (messageId) => {
    createConfirmDialog(
      '确定要删除此文件吗？此操作无法撤销。',
      async () => {
        setIsLoading(true);
        try {
          await axios.delete(`/api/files?messageId=${messageId}`);
          createMessage('文件删除成功！', 'success');
          fetchFiles(); // 刷新文件列表
        } catch (error) {
          createMessage(`文件删除失败: ${error.message}`, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    );
  };



  // 组件加载时获取文件列表
  useEffect(() => {
    fetchFiles();
  }, []);

  // 监听搜索和过滤条件变化
  useEffect(() => {
    setFilteredFiles(filterAndSortFiles(files));
  }, [files, searchTerm, sortBy, sortOrder, filterType]);

  return (
    <div className="app">
      <Head>
        <title>TgNetBucket - 现代化文件存储</title>
        <meta name="description" content="基于Telegram的现代化文件存储服务" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles/globals.css" />
        <link rel="stylesheet" href="/styles/globals.css" />
      </Head>

      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>📦 TgNetBucket</h1>
            <span className="nav-subtitle">现代化文件存储</span>
          </div>
          
          {/* 面包屑导航 */}
          <div className="breadcrumb">
            <span className="breadcrumb-item active">
              <span className="breadcrumb-icon">🏠</span>
              文件管理
            </span>
          </div>
          
          {/* 快速操作栏 */}
          <div className="nav-actions">
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => document.querySelector('input[type="file"]').click()}
                title="快速上传"
              >
                <span className="action-icon">⬆️</span>
                <span className="action-text">上传</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => fetchFiles()}
                title="刷新列表"
              >
                <span className="action-icon">🔄</span>
                <span className="action-text">刷新</span>
              </button>
            </div>
            <div className="nav-divider"></div>
            <a href="/admin" className="admin-link">
              <span className="admin-icon">⚙️</span>
              <span className="admin-text">管理面板</span>
            </a>
          </div>
        </div>
      </nav>

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
              className={`upload-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'uploading' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>拖拽文件到此处或点击上传</h3>
                <p>支持所有文件类型，单文件最大50MB</p>
                <label className="upload-button">
                  <span>选择文件</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleUpload}
                    disabled={isLoading}
                    style={{ display: 'none' }}
                  />
                </label>
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
                        <img src={fileItem.preview} alt={fileItem.name} />
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
              共 {files.length} 个文件 {filteredFiles.length !== files.length && `(显示 ${filteredFiles.length} 个)`}
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
          {filteredFiles.length > 0 && (
            <div className="batch-actions">
              <div className="batch-select">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={selectAllFiles}
                  />
                  <span className="checkmark"></span>
                  全选 ({selectedFiles.size}/{filteredFiles.length})
                </label>
              </div>

              {selectedFiles.size > 0 && (
                <div className="batch-buttons">
                  <button
                    onClick={batchDeleteFiles}
                    className="batch-btn delete-btn"
                    disabled={isLoading}
                  >
                    <span className="btn-icon">🗑️</span>
                    删除选中 ({selectedFiles.size})
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

          {isLoading && !uploadProgress && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          )}
          
          {!isLoading && files.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>还没有文件</h3>
              <p>上传您的第一个文件开始使用吧！</p>
            </div>
          )}

          <div className={`file-container ${viewMode}`}>
            {filteredFiles.map((file) => (
              <div key={file.fileId} className={`file-item ${selectedFiles.has(file.fileId) ? 'selected' : ''}`}>
                {/* 选择框 */}
                <div className="file-select">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.fileId)}
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
                      disabled={isLoading}
                      title="下载文件"
                    >
                      <span className="btn-icon">⬇️</span>
                      <span className="btn-text">下载</span>
                    </button>
                    <button
                      onClick={() => handleGenerateShortLink(file.fileId, file.fileName)}
                      className="action-btn share-btn"
                      disabled={isLoading}
                      title="生成分享链接"
                    >
                      <span className="btn-icon">🔗</span>
                      <span className="btn-text">分享</span>
                    </button>
                    <button
                      onClick={() => handleDelete(file.messageId)}
                      className="action-btn delete-btn"
                      disabled={isLoading}
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

      {/* 页脚 */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 TgNetBucket. 基于 Telegram 的现代化文件存储服务</p>
        </div>
      </footer>


    </div>
  );
}