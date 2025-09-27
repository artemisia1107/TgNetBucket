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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 获取文件列表
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data.files || []);
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

  // 处理文件选择上传
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    await uploadFile(file);
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
    const file = e.dataTransfer.files[0];
    await uploadFile(file);
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
          <div className="nav-actions">
            <a href="/admin" className="admin-link">
              <span className="admin-icon">⚙️</span>
              管理面板
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

        {/* 文件列表区域 */}
        <section className="files-section">
          <div className="section-header">
            <h2>📂 我的文件</h2>
            <div className="file-stats">
              共 {files.length} 个文件
            </div>
          </div>

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

          <div className="file-grid">
            {files.map((file) => (
              <div key={file.fileId} className="file-card">
                <div className="file-header">
                  <div className="file-icon">
                    {getFileIcon(file.fileName)}
                  </div>
                  <div className="file-info">
                    <h4 className="file-name" title={file.fileName}>
                      {file.fileName}
                    </h4>
                    <div className="file-meta">
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
                    下载
                  </button>
                  <button
                    onClick={() => handleGenerateShortLink(file.fileId, file.fileName)}
                    className="action-btn share-btn"
                    disabled={isLoading}
                    title="生成分享链接"
                  >
                    <span className="btn-icon">🔗</span>
                    分享
                  </button>
                  <button
                    onClick={() => handleDelete(file.messageId)}
                    className="action-btn delete-btn"
                    disabled={isLoading}
                    title="删除文件"
                  >
                    <span className="btn-icon">🗑️</span>
                    删除
                  </button>
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