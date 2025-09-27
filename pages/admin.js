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
      </Head>

      <header className="admin-header">
        <h1>TgNetBucket 管理面板</h1>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'overview' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('overview')}
          >
            📊 概览
          </button>
          <button 
            className={activeTab === 'database' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('database')}
          >
            🗄️ 数据库
          </button>
          <a href="/" className="nav-button back-button">
            ← 返回主页
          </a>
        </nav>
      </header>

      <main className="admin-main">
        {message && (
          <div className="message-banner">
            {message}
            <button onClick={() => setMessage('')} className="close-message">×</button>
          </div>
        )}

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'database' && renderDatabase()}
      </main>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-header {
          background: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-bottom: 1px solid #e0e0e0;
        }

        .admin-header h1 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.8rem;
        }

        .admin-nav {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .nav-button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          color: #666;
          font-size: 0.9rem;
        }

        .nav-button:hover {
          background: #f0f0f0;
          border-color: #ccc;
        }

        .nav-button.active {
          background: #0070f3;
          color: white;
          border-color: #0070f3;
        }

        .back-button {
          margin-left: auto;
          background: #f8f9fa !important;
          color: #666 !important;
        }

        .admin-main {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .message-banner {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-message {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
        }

        .status-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .status-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .status-card h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .status-indicator {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .status-indicator.online {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status-indicator.offline {
          background: #ffebee;
          color: #c62828;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #0070f3;
          margin-bottom: 0.5rem;
        }

        .file-types-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .file-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .file-type-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .file-type {
          font-weight: 500;
          color: #495057;
        }

        .file-count {
          color: #0070f3;
          font-weight: bold;
        }

        .management-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .action-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .action-card h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .action-card p {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .action-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-button.cleanup {
          background: #ff5722;
          color: white;
        }

        .action-button.cleanup:hover:not(:disabled) {
          background: #e64a19;
        }

        .action-button.sync {
          background: #2196f3;
          color: white;
        }

        .action-button.sync:hover:not(:disabled) {
          background: #1976d2;
        }

        .redis-info {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .redis-stats {
          margin-top: 1rem;
        }

        .redis-stat {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .redis-stat:last-child {
          border-bottom: none;
        }

        .status-online {
          color: #2e7d32;
          font-weight: 500;
        }

        .logs-container {
          margin-top: 1rem;
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .logs-list {
          padding: 0;
        }

        .log-item {
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
          display: grid;
          grid-template-columns: 150px 100px 1fr 120px;
          gap: 12px;
          font-size: 0.9rem;
        }

        .log-item:last-child {
          border-bottom: none;
        }

        .log-time {
          color: #666;
          font-size: 0.8rem;
        }

        .log-action {
          font-weight: bold;
          color: #007bff;
        }

        .log-details {
          color: #333;
        }

        .log-ip {
          color: #888;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 1rem;
          }

          .admin-nav {
            flex-wrap: wrap;
          }

          .admin-main {
            padding: 1rem;
          }

          .status-cards {
            grid-template-columns: 1fr;
          }

          .management-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}