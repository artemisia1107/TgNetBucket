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

  // 移动端菜单状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 页面加载时获取数据
  useEffect(() => {
    fetchSystemStats();
    fetchSystemStatus();
    fetchActivityLogs();
  }, []);

  // 切换移动端菜单
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 关闭移动端菜单
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // 处理侧边栏链接点击（移动端自动关闭菜单）
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
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
      <div className="section-header">
        <h2>数据库管理</h2>
        <p>管理系统数据和缓存</p>
      </div>

      <div className="database-actions">
        <div className="action-card">
          <div className="card-header">
            <h3>🔄 同步操作</h3>
            <span className="card-badge">系统维护</span>
          </div>
          <p>同步文件系统与数据库，确保数据一致性</p>
          <button 
            className="action-btn primary"
            onClick={handleSyncFiles}
            disabled={loading}
          >
            {loading ? '同步中...' : '同步文件列表'}
          </button>
        </div>

        <div className="action-card">
          <div className="card-header">
            <h3>🗑️ 清理操作</h3>
            <span className="card-badge warning">数据清理</span>
          </div>
          <p>清理过期的短链接数据，释放存储空间</p>
          <button 
            className="action-btn warning"
            onClick={handleCleanupShortLinks}
            disabled={loading}
          >
            {loading ? '清理中...' : '清理短链接'}
          </button>
        </div>

        <div className="action-card">
          <div className="card-header">
            <h3>💾 备份操作</h3>
            <span className="card-badge secondary">数据安全</span>
          </div>
          <p>备份数据库到本地文件，保障数据安全</p>
          <button 
            className="action-btn secondary"
            onClick={handleBackupDatabase}
            disabled={loading}
          >
            {loading ? '备份中...' : '备份数据库'}
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染活动日志页面
  const renderLogs = () => (
    <div className="logs-section">
      <div className="section-header">
        <h2>活动日志</h2>
        <p>查看系统操作记录和活动历史</p>
      </div>

      <div className="logs-filters">
        <div className="filter-group">
          <label>时间范围：</label>
          <select className="filter-select">
            <option value="today">今天</option>
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="all">全部</option>
          </select>
        </div>
        <div className="filter-group">
          <label>操作类型：</label>
          <select className="filter-select">
            <option value="all">全部操作</option>
            <option value="upload">文件上传</option>
            <option value="download">文件下载</option>
            <option value="delete">文件删除</option>
            <option value="admin">管理操作</option>
          </select>
        </div>
      </div>

      <div className="logs-container">
        {activityLogs && activityLogs.length > 0 ? (
          <div className="logs-table">
            <div className="table-header">
              <div className="header-cell">时间</div>
              <div className="header-cell">操作</div>
              <div className="header-cell">详情</div>
              <div className="header-cell">状态</div>
            </div>
            <div className="table-body">
              {activityLogs.map((log, index) => (
                <div key={index} className="table-row">
                  <div className="table-cell">
                    <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="table-cell">
                    <span className="log-action">{log.action}</span>
                  </div>
                  <div className="table-cell">
                    <span className="log-details">{log.details}</span>
                  </div>
                  <div className="table-cell">
                    <span className="log-status success">成功</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>暂无活动记录</h3>
            <p>系统活动日志将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染系统设置页面
  const renderSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>系统设置</h2>
        <p>配置系统参数和功能选项</p>
      </div>

      <div className="settings-groups">
        <div className="settings-group">
          <h3>🔧 基础设置</h3>
          <div className="setting-item">
            <label className="setting-label">
              <span>系统名称</span>
              <input 
                type="text" 
                className="setting-input" 
                defaultValue="TgNetBucket"
                placeholder="输入系统名称"
              />
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <span>最大文件大小 (MB)</span>
              <input 
                type="number" 
                className="setting-input" 
                defaultValue="100"
                placeholder="输入最大文件大小"
              />
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label checkbox">
              <input type="checkbox" defaultChecked />
              <span>启用文件上传</span>
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h3>🔒 安全设置</h3>
          <div className="setting-item">
            <label className="setting-label checkbox">
              <input type="checkbox" defaultChecked />
              <span>启用访问日志</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label checkbox">
              <input type="checkbox" />
              <span>启用IP限制</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <span>短链接过期时间 (天)</span>
              <input 
                type="number" 
                className="setting-input" 
                defaultValue="30"
                placeholder="输入过期天数"
              />
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h3>📊 性能设置</h3>
          <div className="setting-item">
            <label className="setting-label">
              <span>Redis缓存TTL (秒)</span>
              <input 
                type="number" 
                className="setting-input" 
                defaultValue="3600"
                placeholder="输入缓存时间"
              />
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label checkbox">
              <input type="checkbox" defaultChecked />
              <span>启用文件压缩</span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="action-btn primary">保存设置</button>
        <button className="action-btn secondary">重置默认</button>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <Head>
        <title>TgNetBucket - 管理面板</title>
        <meta name="description" content="TgNetBucket 后端管理面板" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles/globals.css" />
        <link rel="stylesheet" href="/styles/pages/admin.css" />
      </Head>

      <div className="admin-layout">
        {/* 移动端菜单切换按钮 */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="切换菜单"
        >
          <span className="menu-icon">☰</span>
        </button>

        {/* 移动端遮罩层 */}
        <div 
          className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        ></div>

        {/* 侧边栏导航 */}
        <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">🚀</div>
              <div className="brand-info">
                <h2 className="brand-title">TgNetBucket</h2>
                <span className="brand-subtitle">管理面板</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-section-title">主要功能</h3>
              <ul className="nav-list">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleNavClick('overview')}
                  >
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">系统概览</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'database' ? 'active' : ''}`}
                    onClick={() => handleNavClick('database')}
                  >
                    <span className="nav-icon">🗄️</span>
                    <span className="nav-text">数据库管理</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => handleNavClick('logs')}
                  >
                    <span className="nav-icon">📋</span>
                    <span className="nav-text">活动日志</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => handleNavClick('settings')}
                  >
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-text">系统设置</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">快速操作</h3>
              <ul className="nav-list">
                <li className="nav-item">
                  <a href="/" className="nav-link external">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">返回主页</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="system-status">
              <div className="status-indicator">
                <span className={`status-dot ${systemStatus?.redis?.connected ? 'online' : 'offline'}`}></span>
                <span className="status-text">
                  {systemStatus?.redis?.connected ? '系统正常' : '系统异常'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="admin-main">
          {/* 顶部面包屑导航 */}
          <header className="content-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item">管理面板</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item current">
                {activeTab === 'overview' && '系统概览'}
                {activeTab === 'database' && '数据库管理'}
                {activeTab === 'logs' && '活动日志'}
                {activeTab === 'settings' && '系统设置'}
              </span>
            </div>
            
            <div className="header-actions">
              <button 
                className="refresh-btn"
                onClick={() => {
                  fetchSystemStats();
                  fetchSystemStatus();
                  if (activeTab === 'logs') {
                    fetchActivityLogs();
                  }
                }}
                disabled={loading}
              >
                <span className="btn-icon">🔄</span>
                刷新数据
              </button>
            </div>
          </header>

          {/* 内容区域 */}
          <div className="content-body">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'database' && renderDatabase()}
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>
    </div>
  );
}