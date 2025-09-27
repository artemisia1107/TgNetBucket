import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * TgNetBucket 主页面组件
 * 提供文件上传、下载、管理等功能
 */
export default function Home() {
  // 基础状态管理
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortBy, setSortBy] = useState('uploadTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * 获取文件列表
   */
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/files');
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 根据文件名获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型
   */
  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    return 'other';
  };

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的文件大小
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  /**
   * 格式化日期
   * @param {string} dateString - 日期字符串
   * @returns {string} 格式化后的日期
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  /**
   * 获取文件图标
   * @param {string} fileName - 文件名
   * @returns {string} 文件图标
   */
  const getFileIcon = (fileName) => {
    const type = getFileType(fileName);
    const icons = {
      image: '🖼️',
      document: '📄',
      video: '🎥',
      audio: '🎵',
      other: '📁'
    };
    return icons[type] || icons.other;
  };

  /**
   * 处理文件上传
   * @param {Event} event - 文件选择事件
   */
  const handleUpload = async (event) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post('/api/files', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
      } catch (error) {
        console.error('上传失败:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    event.target.value = '';
    fetchFiles();
  };

  /**
   * 处理拖拽上传
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
    
    const fileList = Array.from(e.dataTransfer.files);
    if (fileList.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post('/api/files', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
      } catch (error) {
        console.error('上传失败:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    fetchFiles();
  };

  /**
   * 删除文件
   * @param {string} messageId - 消息ID
   */
  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`/api/files?messageId=${messageId}`);
      fetchFiles();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  /**
   * 下载文件
   * @param {string} fileId - 文件ID
   * @param {string} fileName - 文件名
   */
  const handleDownload = (fileId, fileName) => {
    window.open(`/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`, '_blank');
  };

  /**
   * 生成短链接
   * @param {string} fileId - 文件ID
   */
  const handleGenerateShortLink = async (fileId) => {
    try {
      const response = await axios.post('/api/short-link', { fileId });
      if (response.data.shortUrl) {
        navigator.clipboard.writeText(response.data.shortUrl);
        alert('短链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('生成短链接失败:', error);
    }
  };

  // 初始化加载文件列表
  useEffect(() => {
    fetchFiles();
  }, []);

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

        {/* 文件列表区域 */}
        <section className="files-section">
          <div className="section-header">
            <h2>📂 我的文件</h2>
            <div className="file-stats">
              共 {filteredFiles.length} 个文件
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

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          )}
          
          {!loading && filteredFiles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>还没有文件</h3>
              <p>上传您的第一个文件开始使用吧！</p>
            </div>
          )}

          <div className={`file-container ${viewMode}`}>
            {filteredFiles.map((file) => (
              <div key={file.fileId} className="file-item">
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
                      disabled={loading}
                      title="下载文件"
                    >
                      <span className="btn-icon">⬇️</span>
                      <span className="btn-text">下载</span>
                    </button>
                    <button
                      onClick={() => handleGenerateShortLink(file.fileId)}
                      className="action-btn share-btn"
                      disabled={loading}
                      title="生成分享链接"
                    >
                      <span className="btn-icon">🔗</span>
                      <span className="btn-text">分享</span>
                    </button>
                    <button
                      onClick={() => handleDelete(file.messageId)}
                      className="action-btn delete-btn"
                      disabled={loading}
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