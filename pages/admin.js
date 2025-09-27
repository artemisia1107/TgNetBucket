/**
 * 管理面板页面组件
 * 提供系统状态监控、数据库管理和活动日志查看功能
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { 
  createMessage, 
  createLoader, 
  createConfirmDialog,
  formatFileSize,
  formatDate,
  AnimationUtils 
} from '../components/common';

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
      createMessage('获取系统统计失败', 'error');
    }
  };

  // 获取系统状态
  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get('/api/admin/status');
      setSystemStatus(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取系统状态失败:', error);
      createMessage('获取系统状态失败', 'error');
    }
  };

  // 获取活动日志
  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get('/api/admin/activity-logs?limit=50');
      setActivityLogs(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取活动日志失败:', error);
      createMessage('获取活动日志失败', 'error');
    }
  };

  // 清理短链接数据
  const handleCleanupShortLinks = async () => {
    const confirmed = await createConfirmDialog('确定要清理所有旧的短链接数据吗？');
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/cleanup-short-links');
      createMessage(`清理完成：扫描 ${response.data.scannedCount} 个键，删除 ${response.data.deletedCount} 个短链接`, 'success');
      fetchSystemStats(); // 刷新统计
    } catch (error) {
      createMessage(`清理失败: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 同步文件列表
  const handleSyncFiles = async () => {
    const confirmed = await createConfirmDialog('确定要从Telegram重新同步文件列表吗？');
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/sync-files');
      createMessage(`同步完成：处理 ${response.data.syncedCount} 个文件`, 'success');
      fetchSystemStats(); // 刷新统计
    } catch (error) {
      createMessage(`同步失败: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 备份数据库
  const handleBackupDatabase = async () => {
    const confirmed = await createConfirmDialog('确定要备份数据库吗？');
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/backup');
      createMessage(`备份完成：${response.data.message || '数据库备份成功'}`, 'success');
      if (response.data.data) {
        createMessage(`备份完成：${response.data.data.filename} (${response.data.data.keysCount} 个键)`, 'success');
      }
    } catch (error) {
      createMessage(`备份失败: ${error.response?.data?.error || error.message}`, 'error');
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
        <link rel="stylesheet" href="/styles/globals.css" />
        <link rel="stylesheet" href="/styles/admin.css" />
        <link rel="stylesheet" href="/styles/components.css" />
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
          <div className="content-area">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'database' && renderDatabase()}
          </div>
        </main>
      </div>


    </div>
  );
}