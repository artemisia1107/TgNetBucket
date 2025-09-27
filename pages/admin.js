/**
 * 管理面板页面组件
 * 提供系统状态监控、数据库管理和活动日志查看功能
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

/**
 * 后端管理页面
 * 提供系统监控、文件统计、数据库管理等功能
 */
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [activityLogs, setActivityLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 获取系统统计信息
  const fetchSystemStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setSystemStats(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取系统统计失败:', error);
      setMessage('获取系统统计失败');
    }
  };

  // 获取系统状态
  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get('/api/admin/status');
      setSystemStatus(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取系统状态失败:', error);
      setMessage('获取系统状态失败');
    }
  };

  // 获取活动日志
  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get('/api/admin/activity-logs?limit=50');
      setActivityLogs(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取活动日志失败:', error);
      setMessage('获取活动日志失败');
    }
  };

  // 清理短链接数据
  const handleCleanupShortLinks = async () => {
    if (!confirm('确定要清理所有旧的短链接数据吗？')) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/cleanup-short-links');
      setMessage(`清理完成：扫描 ${response.data.scannedCount} 个键，删除 ${response.data.deletedCount} 个短链接`);
      fetchSystemStats(); // 刷新统计
    } catch (error) {
      setMessage(`清理失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 同步文件列表
  const handleSyncFiles = async () => {
    if (!confirm('确定要从Telegram重新同步文件列表吗？')) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/sync-files');
      setMessage(`同步完成：处理 ${response.data.syncedCount} 个文件`);
      fetchSystemStats(); // 刷新统计
    } catch (error) {
      setMessage(`同步失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 备份数据库
  const handleBackupDatabase = async () => {
    if (!confirm('确定要备份数据库吗？')) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/backup');
      setMessage(`备份完成：${response.data.message || '数据库备份成功'}`);
      if (response.data.data) {
        setMessage(`备份完成：${response.data.data.filename} (${response.data.data.keysCount} 个键)`);
      }
    } catch (error) {
      setMessage(`备份失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchSystemStats();
    fetchSystemStatus();
    fetchActivityLogs();
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 渲染概览页面
  const renderOverview = () => (
    <div className="overview-section">
      <h2>系统概览</h2>
      
      {/* 系统状态卡片 */}
      <div className="status-cards">
        <div className="status-card">
          <h3>🔗 Redis 状态</h3>
          <div className={`status-indicator ${systemStatus?.redis?.connected ? 'online' : 'offline'}`}>
            {systemStatus?.redis?.connected ? '已连接' : '未连接'}
          </div>
          <p>{systemStatus?.redis?.environment || '未知环境'}</p>
        </div>

        <div className="status-card">
          <h3>🤖 Telegram Bot</h3>
          <div className={`status-indicator ${systemStatus?.telegram?.configured ? 'online' : 'offline'}`}>
            {systemStatus?.telegram?.configured ? '已配置' : '未配置'}
          </div>
          <p>Chat ID: {systemStatus?.telegram?.chatId || '未设置'}</p>
        </div>

        <div className="status-card">
          <h3>📁 文件总数</h3>
          <div className="stat-number">{systemStats?.totalFiles || 0}</div>
          <p>总大小: {formatFileSize(systemStats?.totalSize || 0)}</p>
        </div>

        <div className="status-card">
          <h3>🔗 短链接</h3>
          <div className="stat-number">{systemStats?.shortLinks || 0}</div>
          <p>活跃链接数量</p>
        </div>
      </div>

      {/* 文件类型统计 */}
      {systemStats?.fileTypes && (
        <div className="file-types-section">
          <h3>文件类型分布</h3>
          <div className="file-types-grid">
            {Object.entries(systemStats.fileTypes).map(([type, count]) => (
              <div key={type} className="file-type-item">
                <span className="file-type">{type || '未知'}</span>
                <span className="file-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染数据库管理页面
  const renderDatabase = () => (
    <div className="database-section">
      <h2>数据库管理</h2>
      
      <div className="management-actions">
        <div className="action-card">
          <h3>🧹 清理短链接</h3>
          <p>清理所有旧的 short:* 格式数据，释放数据库空间</p>
          <button 
            onClick={handleCleanupShortLinks}
            disabled={loading}
            className="action-button cleanup"
          >
            {loading ? '清理中...' : '开始清理'}
          </button>
        </div>

        <div className="action-card">
          <h3>🔄 同步文件</h3>
          <p>从Telegram重新同步文件列表到数据库</p>
          <button 
            onClick={handleSyncFiles}
            disabled={loading}
            className="action-button sync"
          >
            {loading ? '同步中...' : '开始同步'}
          </button>
        </div>
      </div>

      {/* Redis 使用情况 */}
      {systemStatus?.redis?.connected && (
        <div className="redis-info">
          <h3>Redis 使用情况</h3>
          <div className="redis-stats">
            <div className="redis-stat">
              <span>环境:</span>
              <span>{systemStatus.redis.environment}</span>
            </div>
            <div className="redis-stat">
              <span>连接状态:</span>
              <span className="status-online">已连接</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      <Head>
        <title>TgNetBucket - 管理面板</title>
        <meta name="description" content="TgNetBucket 后端管理面板" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 顶部导航栏 */}
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>🚀 TgNetBucket</h1>
            <span className="nav-subtitle">管理面板</span>
          </div>
          <a href="/" className="back-home">
            <span>🏠</span>
            返回主页
          </a>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="main-wrapper">
        {/* 侧边栏导航 */}
        <aside className="sidebar">
          <div className="sidebar-content">
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="tab-icon">📊</span>
                <span className="tab-text">系统概览</span>
              </button>
              <button 
                className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
                onClick={() => setActiveTab('database')}
              >
                <span className="tab-icon">🗄️</span>
                <span className="tab-text">数据库管理</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="main-content">
          {message && (
            <div className="alert-message">
              <div className="alert-content">
                <span className="alert-icon">ℹ️</span>
                <span className="alert-text">{message}</span>
                <button onClick={() => setMessage('')} className="alert-close">×</button>
              </div>
            </div>
          )}

          <div className="content-area">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'database' && renderDatabase()}
          </div>
        </main>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
        }

        /* 顶部导航栏 */
        .top-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand h1 {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .nav-subtitle {
          font-size: 0.9rem;
          color: #666;
          margin-left: 0.5rem;
        }

        .back-home {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .back-home:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* 主要布局 */
        .main-wrapper {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 80px);
        }

        /* 侧边栏 */
        .sidebar {
          width: 280px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem 0;
        }

        .sidebar-content {
          padding: 0 1.5rem;
        }

        .tab-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          font-size: 1rem;
          color: #666;
          position: relative;
          overflow: hidden;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          transition: left 0.3s ease;
          z-index: -1;
        }

        .tab-button:hover::before {
          left: 0;
        }

        .tab-button:hover {
          color: white;
          transform: translateX(5px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-text {
          font-weight: 500;
        }

        /* 主内容区 */
        .main-content {
          flex: 1;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
        }

        .content-area {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* 消息提示 */
        .alert-message {
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border-radius: 12px;
          border-left: 4px solid #2196f3;
          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.2);
        }

        .alert-icon {
          font-size: 1.2rem;
        }

        .alert-text {
          flex: 1;
          color: #1565c0;
          font-weight: 500;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #1565c0;
          padding: 0.25rem;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .alert-close:hover {
          background: rgba(21, 101, 192, 0.1);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 状态卡片 */
        .status-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .status-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .status-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .status-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .status-card h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-indicator {
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .status-indicator.online {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
        }

        .status-indicator.offline {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        /* 文件类型统计 */
        .file-types-section {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
        }

        .file-types-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .file-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .file-type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          transition: all 0.3s ease;
        }

        .file-type-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }

        .file-type {
          font-weight: 600;
          color: #495057;
        }

        .file-count {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1.1rem;
        }

        /* 管理操作 */
        .management-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .action-card h3 {
          margin: 0 0 0.75rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-card p {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .action-button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .action-button.cleanup {
          background: linear-gradient(135deg, #ff5722, #e64a19);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
        }

        .action-button.cleanup:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 87, 34, 0.4);
        }

        .action-button.sync {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
        }

        .action-button.sync:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
        }

        /* Redis信息 */
        .redis-info {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
        }

        .redis-info h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .redis-stats {
          margin-top: 1.5rem;
        }

        .redis-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.2s ease;
        }

        .redis-stat:last-child {
          border-bottom: none;
        }

        .redis-stat:hover {
          background: rgba(102, 126, 234, 0.05);
          margin: 0 -1rem;
          padding: 1rem;
          border-radius: 8px;
        }

        .redis-stat span:first-child {
          font-weight: 600;
          color: #495057;
        }

        .status-online {
          background: linear-gradient(135deg, #4caf50, #45a049);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }

        /* 活动日志 */
        .logs-container {
          margin-top: 1.5rem;
          max-height: 500px;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logs-container h3 {
          margin: 0 0 1.5rem 0;
          padding: 1.5rem 1.5rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logs-list {
          padding: 0 1.5rem 1.5rem;
        }

        .log-item {
          padding: 1rem;
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
          display: grid;
          grid-template-columns: 150px 120px 1fr 140px;
          gap: 1rem;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .log-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .log-item:hover {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(5px);
        }

        .log-time {
          color: #666;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .log-action {
          font-weight: 600;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          background-color: rgba(102, 126, 234, 0.1);
          text-align: center;
          font-size: 0.8rem;
        }

        .log-details {
          color: #333;
          font-weight: 500;
        }

        .log-ip {
          color: #888;
          font-size: 0.8rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: rgba(102, 126, 234, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          text-align: center;
        }

        /* 响应式设计 */
        @media (max-width: 1024px) {
          .main-wrapper {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            padding: 1rem 0;
          }

          .tab-buttons {
            flex-direction: row;
            justify-content: center;
            gap: 1rem;
          }

          .tab-button {
            flex: 1;
            max-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .nav-brand {
            text-align: center;
          }

          .main-content {
            padding: 1rem;
          }

          .content-area {
            padding: 1.5rem;
          }

          .status-cards {
            grid-template-columns: 1fr;
          }

          .management-actions {
            grid-template-columns: 1fr;
          }

          .file-types-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }

          .log-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: left;
          }

          .log-action, .log-ip {
            justify-self: start;
            width: fit-content;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0.75rem;
          }

          .nav-brand h1 {
            font-size: 1.2rem;
          }

          .main-content {
            padding: 0.75rem;
          }

          .content-area {
            padding: 1rem;
          }

          .status-card, .action-card, .file-types-section, .redis-info, .logs-container {
            padding: 1.5rem;
          }

          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}