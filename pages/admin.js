/**
 * 管理面板页面组件
 * 提供系统状态监控、数据库管理和活动日志查看功能
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';
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
  /**
   * 获取系统统计信息
   * @returns {Promise<void>}
   */
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
  /**
   * 获取系统状态信息
   * @returns {Promise<void>}
   */
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
  /**
   * 清理过期的短链接
   * @returns {Promise<void>}
   */
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
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon">🔗</div>
            <h3 className="stat-title">Redis 状态</h3>
          </div>
          <div className="stat-body">
            <div className={`stat-value ${systemStatus?.redis?.connected ? 'success' : 'error'}`}>
              {systemStatus?.redis?.connected ? '已连接' : '未连接'}
            </div>
            <div className="stat-change neutral">
              <span className="stat-change-text">{systemStatus?.redis?.environment || '未知环境'}</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-icon">🤖</div>
            <h3 className="stat-title">Telegram Bot</h3>
          </div>
          <div className="stat-body">
            <div className={`stat-value ${systemStatus?.telegram?.configured ? 'success' : 'error'}`}>
              {systemStatus?.telegram?.configured ? '已配置' : '未配置'}
            </div>
            <div className="stat-change neutral">
              <span className="stat-change-text">Chat ID: {systemStatus?.telegram?.chatId || '未设置'}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">📁</div>
            <h3 className="stat-title">文件总数</h3>
          </div>
          <div className="stat-body">
            <div className="stat-value">{systemStats?.totalFiles || 0}</div>
            <div className="stat-change positive">
              <span className="stat-change-text">总大小: {formatFileSize(systemStats?.totalSize || 0)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card error">
          <div className="stat-header">
            <div className="stat-icon">🔗</div>
            <h3 className="stat-title">短链接</h3>
          </div>
          <div className="stat-body">
            <div className="stat-value">{systemStats?.shortLinks || 0}</div>
            <div className="stat-change positive">
              <span className="stat-change-text">活跃链接数量</span>
            </div>
          </div>
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
    <div className="admin-content">
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">数据库管理</h2>
          <div className="admin-table-actions">
            <button className="header-action" onClick={() => window.location.reload()}>
              <span>🔄</span>
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">🔄</div>
              <h3 className="stat-title">同步操作</h3>
            </div>
            <div className="stat-body">
              <div className="stat-value">文件同步</div>
              <div className="stat-change neutral">
                <span className="stat-change-text">同步文件系统与数据库，确保数据一致性</span>
              </div>
              <button 
                className="table-action"
                onClick={handleSyncFiles}
                disabled={loading}
                style={{ marginTop: 'var(--spacing-4)', width: '100%', height: 'auto', padding: 'var(--spacing-3)' }}
              >
                {loading ? '同步中...' : '同步文件列表'}
              </button>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-icon">🗑️</div>
              <h3 className="stat-title">清理操作</h3>
            </div>
            <div className="stat-body">
              <div className="stat-value">数据清理</div>
              <div className="stat-change neutral">
                <span className="stat-change-text">清理过期的短链接数据，释放存储空间</span>
              </div>
              <button 
                className="table-action danger"
                onClick={handleCleanupShortLinks}
                disabled={loading}
                style={{ marginTop: 'var(--spacing-4)', width: '100%', height: 'auto', padding: 'var(--spacing-3)' }}
              >
                {loading ? '清理中...' : '清理短链接'}
              </button>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-header">
              <div className="stat-icon">💾</div>
              <h3 className="stat-title">备份操作</h3>
            </div>
            <div className="stat-body">
              <div className="stat-value">数据安全</div>
              <div className="stat-change neutral">
                <span className="stat-change-text">备份数据库到本地文件，保障数据安全</span>
              </div>
              <button 
                className="table-action"
                onClick={handleBackupDatabase}
                disabled={loading}
                style={{ marginTop: 'var(--spacing-4)', width: '100%', height: 'auto', padding: 'var(--spacing-3)' }}
              >
                {loading ? '备份中...' : '备份数据库'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染活动日志页面
  const renderLogs = () => (
    <div className="admin-content">
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">活动日志</h2>
          <div className="admin-table-actions">
            <select className="header-action" style={{ width: 'auto', padding: 'var(--spacing-2) var(--spacing-3)' }}>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="all">全部</option>
            </select>
            <select className="header-action" style={{ width: 'auto', padding: 'var(--spacing-2) var(--spacing-3)' }}>
              <option value="all">全部操作</option>
              <option value="upload">文件上传</option>
              <option value="download">文件下载</option>
              <option value="delete">文件删除</option>
              <option value="admin">管理操作</option>
            </select>
            <button className="header-action" onClick={() => fetchActivityLogs()}>
              <span>🔄</span>
            </button>
          </div>
        </div>

        {activityLogs && activityLogs.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>操作</th>
                <th>详情</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log, index) => (
                <tr key={index}>
                  <td>
                    <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </td>
                  <td>
                    <span className="log-action">{log.action}</span>
                  </td>
                  <td>
                    <span className="log-details">{log.details}</span>
                  </td>
                  <td>
                    <span className="stat-change positive">成功</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-action" title="查看详情">
                        <span>👁️</span>
                      </button>
                      <button className="table-action danger" title="删除记录">
                        <span>🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 'var(--spacing-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>📋</div>
            <h3 style={{ margin: '0 0 var(--spacing-2)', color: 'var(--color-text-secondary)' }}>暂无活动记录</h3>
            <p style={{ margin: 0 }}>系统活动日志将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染系统设置页面
  const renderSettings = () => (
    <div className="admin-content">
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">系统设置</h2>
          <div className="admin-table-actions">
            <button className="header-action" title="保存设置">
              <span>💾</span>
            </button>
            <button className="header-action" title="重置设置">
              <span>🔄</span>
            </button>
            <button className="header-action" title="导出配置">
              <span>📤</span>
            </button>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">🔧</span>
                基础设置
              </h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">系统名称</label>
                <input 
                  type="text" 
                  className="form-input"
                  defaultValue="TgNetBucket"
                  placeholder="输入系统名称"
                />
              </div>
              <div className="form-group">
                <label className="form-label">最大文件大小 (MB)</label>
                <input 
                  type="number" 
                  className="form-input"
                  defaultValue="100"
                  placeholder="输入最大文件大小"
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>启用文件上传</span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">🔒</span>
                安全设置
              </h3>
            </div>
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>启用访问日志</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>启用IP限制</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">短链接过期时间 (天)</label>
                <input 
                  type="number" 
                  className="form-input"
                  defaultValue="30"
                  placeholder="输入过期天数"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">🤖</span>
                Telegram 设置
              </h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bot Token</label>
                <input 
                  type="password" 
                  className="form-input"
                  placeholder="输入 Telegram Bot Token"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chat ID</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="输入 Chat ID"
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>启用 Telegram 通知</span>
                </label>
              </div>
            </div>
          </div>
        </div>
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
      </Head>

      <div className="admin-layout">
        <AdminHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          closeMobileMenu={closeMobileMenu}
          onRefresh={() => {
            if (activeTab === 'overview') {
              fetchSystemStats();
              fetchSystemStatus();
            } else if (activeTab === 'logs') {
              fetchActivityLogs();
            }
          }}
          loading={loading}
        />

        {/* 主内容区域 */}
        <main className="admin-main">

          {/* 内容区域 */}
          <div className="content-body">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'database' && renderDatabase()}
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}