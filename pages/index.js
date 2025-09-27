import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

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
      setMessage(`获取文件列表失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 上传文件处理函数
  const uploadFile = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    setMessage('正在上传文件...');

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

      setMessage('✅ 文件上传成功！');
      fetchFiles(); // 刷新文件列表
      setTimeout(() => setMessage(''), 3000); // 3秒后清除消息
    } catch (error) {
      setMessage(`❌ 文件上传失败: ${error.message}`);
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
        
        // 复制到剪贴板
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shortUrl);
          setMessage(`短链接已生成并复制到剪贴板: ${shortUrl}`);
        } else {
          // 降级方案：显示链接让用户手动复制
          setMessage(`短链接已生成: ${shortUrl}`);
        }
      }
    } catch (error) {
      setMessage(`生成短链接失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文件
  const handleDelete = async (messageId) => {
    if (!confirm('确定要删除此文件吗？')) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/files?messageId=${messageId}`);
      setMessage('文件删除成功！');
      fetchFiles(); // 刷新文件列表
    } catch (error) {
      setMessage(`文件删除失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取文件图标
  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const iconMap = {
      // 图片
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
      // 视频
      'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'wmv': '🎬', 'flv': '🎬', 'mkv': '🎬', 'webm': '🎬',
      // 音频
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'aac': '🎵', 'ogg': '🎵', 'm4a': '🎵',
      // 文档
      'pdf': '📕', 'doc': '📘', 'docx': '📘', 'txt': '📄', 'rtf': '📄',
      'xls': '📗', 'xlsx': '📗', 'csv': '📗',
      'ppt': '📙', 'pptx': '📙',
      // 压缩包
      'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦',
      // 代码
      'js': '💻', 'ts': '💻', 'jsx': '💻', 'tsx': '💻', 'vue': '💻', 'react': '💻',
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨', 'less': '🎨',
      'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️', 'php': '🐘', 'go': '🐹',
      'json': '📋', 'xml': '📋', 'yaml': '📋', 'yml': '📋',
      // 其他
      'exe': '⚙️', 'msi': '⚙️', 'dmg': '💿', 'iso': '💿', 'apk': '📱'
    };
    
    return iconMap[ext] || '📄';
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

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
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
                        {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : '未知大小'}
                      </span>
                      <span className="file-date">
                        {file.uploadTime ? new Date(file.uploadTime).toLocaleDateString('zh-CN') : ''}
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

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
        }

        /* 导航栏 */
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-subtitle {
          font-size: 0.8rem;
          color: #666;
          margin-left: 0.5rem;
        }

        .admin-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .admin-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* 主内容区域 */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* 英雄区域 */
        .hero-section {
          text-align: center;
          padding: 4rem 0 2rem;
          color: white;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hero-description {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        /* 上传区域 */
        .upload-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInLeft 0.8s ease-out 0.6s both;
        }

        .upload-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .upload-zone {
          background: rgba(255, 255, 255, 0.95);
          border: 2px dashed #ddd;
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .upload-zone.dragging {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }

        .upload-zone.uploading {
          border-color: #28a745;
        }

        .upload-content {
          position: relative;
          z-index: 2;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-zone h3 {
          margin: 0 0 0.5rem;
          font-size: 1.3rem;
          color: #333;
        }

        .upload-zone p {
          margin: 0 0 1.5rem;
          color: #666;
        }

        .upload-button {
          display: inline-block;
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .upload-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .upload-button:hover::before {
          left: 100%;
        }

        .upload-button:active {
          transform: translateY(0);
        }

        .progress-container {
          margin-top: 1.5rem;
          position: relative;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .progress-text {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 10px;
          font-weight: 500;
          text-align: center;
        }

        .message.success {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.2);
        }

        .message.error {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.2);
        }

        /* 文件列表区域 */
        .files-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInRight 0.8s ease-out 0.8s both;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          color: white;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .file-stats {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 动画效果 */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-10px);
          }
          70% {
            transform: translateY(-5px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: white;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
        }

        .empty-state p {
          opacity: 0.8;
          font-size: 1rem;
        }

        /* 文件网格 */
        .file-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .file-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          animation: slideInScale 0.5s ease-out both;
          position: relative;
          overflow: hidden;
        }

        .file-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .file-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .file-card:hover::before {
          left: 100%;
        }

        .file-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .file-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .file-size, .file-date {
          font-size: 0.85rem;
          color: #666;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
          min-width: 80px;
        }

        .download-btn {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
        }

        .share-btn {
          background: linear-gradient(135deg, #28a745, #1e7e34);
          color: white;
        }

        .delete-btn {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 1rem;
        }

        /* 页脚 */
        .footer {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          text-align: center;
          padding: 2rem;
        }

        .footer-content p {
          margin: 0;
          opacity: 0.8;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .nav-container {
            padding: 1rem;
          }

          .main-content {
            padding: 0 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .upload-zone {
            padding: 2rem 1rem;
          }

          .file-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .file-actions {
            flex-direction: column;
          }

          .action-btn {
            flex: none;
          }
        }

        @media (max-width: 480px) {
          .nav-brand h1 {
            font-size: 1.2rem;
          }

          .nav-subtitle {
            display: none;
          }

          .hero-title {
            font-size: 1.8rem;
          }

          .upload-zone h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}