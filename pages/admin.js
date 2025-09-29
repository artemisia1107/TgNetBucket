/**
 * 管理面板页面组件
 * 提供系统状态监控、数据库管理和活动日志查看功能
 */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/layout/Footer';
import AdminHeader from '../components/layout/AdminHeader';
import axios from 'axios';
import { 
  createSuccessMessage, 
  createErrorMessage
} from '../components/ui/Message';
import { createConfirmDialog } from '../components/ui/Modal';
import AuthModal from '../components/AuthModal';
import { getAuthStatus } from '../utils/authUtils';
import { useAdminPanel } from '../hooks/useAdminPanel';

// 认证状态常量
const AUTH_STATUS = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  EXPIRED: 'expired'
};

// 临时定义formatFileSize函数，避免导入错误
const formatFileSize = (bytes) => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 后端管理页面
 * 提供系统监控、文件统计、数据库管理等功能
 */
export default function AdminPanel() {
  // 使用useAdminPanel hook管理管理面板状态
  const {
    activeTab,
    setActiveTab,
    systemStats,
    systemStatus,
    activityLogs,
    loading,
    fetchSystemStats,
    fetchSystemStatus,
    fetchActivityLogs,
    cleanupShortLinks,
    syncFiles,
    backupDatabase,
    refreshAllData
  } = useAdminPanel();
  
  // 认证状态管理
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // 图片交互样式状态管理
  const [imageInteractionStyle, setImageInteractionStyle] = useState('fade');
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  const [interactionEnabled, setInteractionEnabled] = useState(true);
  
  // 通知状态管理
  const [notifications, setNotifications] = useState([]);
  
  // 侧边栏状态管理
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);



  // 清理短链接数据 - 使用hook提供的方法
  const handleCleanupShortLinks = cleanupShortLinks;

  // 使用hook提供的方法
  const handleSyncFiles = syncFiles;
  const handleBackupDatabase = backupDatabase;

  // 移动端菜单状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * 切换侧边栏显示状态（桌面端）
   */
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  /**
   * 添加通知
   * @param {Object} notification - 通知对象
   */
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // 最多保留10条通知
  }, []);

  /**
   * 处理登出
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setShowAuthModal(true);
    addNotification({
      type: 'info',
      title: '已退出登录',
      message: '您已成功退出管理面板'
    });
  }, [addNotification]);

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

  /**
   * 检查认证状态
   */
  const checkAuthentication = useCallback(() => {
    const authStatus = getAuthStatus();
    const authenticated = authStatus === AUTH_STATUS.AUTHENTICATED;
    
    setIsAuthenticated(authenticated);
    setAuthChecked(true);
    
    if (!authenticated) {
      setShowAuthModal(true);
    }
    
    return authenticated;
  }, []);

  /**
   * 处理认证成功
   */
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    // 认证成功后加载数据
    fetchSystemStats();
    fetchSystemStatus();
    fetchActivityLogs();
  };

  /**
   * 处理认证弹窗关闭
   */
  const handleAuthClose = () => {
    setShowAuthModal(false);
    // 如果用户关闭认证弹窗但未认证，重定向到首页
    if (!isAuthenticated) {
      window.location.href = '/';
    }
  };

  /**
   * 处理图片交互样式变化
   * @param {string} style - 选择的交互样式 ('fade' 或 'underline')
   */
  const handleInteractionChange = (style) => {
    setImageInteractionStyle(style);
    
    // 应用样式到全局
    const root = document.documentElement;
    root.setAttribute('data-image-interaction', style);
    
    // 保存到本地存储
    localStorage.setItem('imageInteractionStyle', style);
    
    createSuccessMessage(`图片交互样式已切换为: ${style === 'fade' ? '淡入淡出效果' : '下划线效果'}`);
  };

  /**
   * 处理动画速度变化
   * @param {string} speed - 动画速度 ('fast', 'normal', 'slow')
   */
  const handleAnimationSpeedChange = (speed) => {
    setAnimationSpeed(speed);
    
    // 应用速度到全局
    const root = document.documentElement;
    root.setAttribute('data-animation-speed', speed);
    
    // 保存到本地存储
    localStorage.setItem('animationSpeed', speed);
  };

  /**
   * 处理交互效果开关
   * @param {boolean} enabled - 是否启用交互效果
   */
  const handleInteractionToggle = (enabled) => {
    setInteractionEnabled(enabled);
    
    // 应用到全局
    const root = document.documentElement;
    root.setAttribute('data-interaction-enabled', enabled.toString());
    
    // 保存到本地存储
    localStorage.setItem('interactionEnabled', enabled.toString());
  };

  // 页面加载时检查认证状态
  useEffect(() => {
    const authenticated = checkAuthentication();
    if (authenticated) {
      fetchSystemStats();
      fetchSystemStatus();
      fetchActivityLogs();
    }
  }, [checkAuthentication, fetchSystemStats, fetchSystemStatus, fetchActivityLogs]);

  // 恢复图片交互样式设置
  useEffect(() => {
    // 从本地存储恢复设置
    const savedStyle = localStorage.getItem('imageInteractionStyle');
    const savedSpeed = localStorage.getItem('animationSpeed');
    const savedEnabled = localStorage.getItem('interactionEnabled');

    if (savedStyle) {
      setImageInteractionStyle(savedStyle);
      document.documentElement.setAttribute('data-image-interaction', savedStyle);
    }

    if (savedSpeed) {
      setAnimationSpeed(savedSpeed);
      document.documentElement.setAttribute('data-animation-speed', savedSpeed);
    }

    if (savedEnabled !== null) {
      const enabled = savedEnabled === 'true';
      setInteractionEnabled(enabled);
      document.documentElement.setAttribute('data-interaction-enabled', enabled.toString());
    }
  }, []);

  // 渲染概览页面
  const renderOverview = () => (
    <div className="overview-section">
      <h2>系统概览</h2>
      
      {/* 系统状态卡片 */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-database" />
            </div>
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
            <div className="stat-icon">
              <i className="fab fa-telegram-plane" />
            </div>
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
            <div className="stat-icon">
              <i className="fas fa-folder" />
            </div>
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
            <div className="stat-icon">
              <i className="fas fa-link" />
            </div>
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
              <i className="fas fa-sync-alt" />
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <i className="fas fa-sync-alt" />
              </div>
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
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    <span style={{ marginLeft: '8px' }}>同步中...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt" />
                    <span style={{ marginLeft: '8px' }}>同步文件列表</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-icon">
                <i className="fas fa-trash-alt" />
              </div>
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
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    <span style={{ marginLeft: '8px' }}>清理中...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt" />
                    <span style={{ marginLeft: '8px' }}>清理短链接</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-header">
              <div className="stat-icon">
                <i className="fas fa-save" />
              </div>
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
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    <span style={{ marginLeft: '8px' }}>备份中...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save" />
                    <span style={{ marginLeft: '8px' }}>备份数据库</span>
                  </>
                )}
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
              <i className="fas fa-sync-alt" />
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
                        <i className="fas fa-eye" />
                      </button>
                      <button className="table-action danger" title="删除记录">
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 'var(--spacing-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
              <i className="fas fa-clipboard-list" />
            </div>
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
              <i className="fas fa-save" />
            </button>
            <button className="header-action" title="重置设置">
              <i className="fas fa-undo" />
            </button>
            <button className="header-action" title="导出配置">
              <i className="fas fa-download" />
            </button>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">
                  <i className="fas fa-cog" />
                </span>
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
                <span className="section-icon">
                  <i className="fas fa-shield-alt" />
                </span>
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
                <span className="section-icon">
                  <i className="fas fa-palette" />
                </span>
                图片交互样式
              </h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">交互效果选择</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="imageInteraction" 
                      value="fade" 
                      checked={imageInteractionStyle === 'fade'}
                      onChange={(e) => handleInteractionChange(e.target.value)}
                    />
                    <span className="radio-text">
                      <i className="fas fa-eye" />
                      淡入淡出效果
                    </span>
                    <span className="radio-description">鼠标悬停时图片淡入淡出</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="imageInteraction" 
                      value="underline" 
                      checked={imageInteractionStyle === 'underline'}
                      onChange={(e) => handleInteractionChange(e.target.value)}
                    />
                    <span className="radio-text">
                      <i className="fas fa-underline" />
                      下划线效果
                    </span>
                    <span className="radio-description">鼠标悬停时显示下划线</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">动画速度</label>
                <select 
                  className="form-select"
                  value={animationSpeed}
                  onChange={(e) => handleAnimationSpeedChange(e.target.value)}
                >
                  <option value="fast">快速 (150ms)</option>
                  <option value="normal">正常 (300ms)</option>
                  <option value="slow">慢速 (500ms)</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={interactionEnabled}
                    onChange={(e) => handleInteractionToggle(e.target.checked)}
                  />
                  <span>启用图片交互效果</span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">
                  <i className="fab fa-telegram-plane" />
                </span>
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



  // 如果认证检查未完成，显示加载状态
  if (!authChecked) {
    return (
      <div className="admin-container">
        <Head>
          <title>TgNetBucket - 管理面板</title>
          <meta name="description" content="TgNetBucket 后端管理面板" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="admin-loading">
          <div className="loading-spinner" />
          <p>正在验证权限...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-container">
        <Head>
          <title>TgNetBucket - 管理面板</title>
          <meta name="description" content="TgNetBucket 后端管理面板" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

      <div className="admin-layout">
        {/* 使用AdminHeader组件 */}
        <AdminHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          closeMobileMenu={closeMobileMenu}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          systemStats={systemStats}
          notifications={notifications}
          onLogout={handleLogout}
          onRefresh={() => {
            fetchSystemStats();
            fetchSystemStatus();
            fetchActivityLogs();
          }}
          loading={loading}
        />

        {/* 主内容区域 */}
        <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* 内容区域 */}
          <div className="admin-content">
            <div className="content-body">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'database' && renderDatabase()}
              {activeTab === 'logs' && renderLogs()}
              {activeTab === 'settings' && renderSettings()}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
    
    {/* 认证弹窗 */}
    <AuthModal 
      isOpen={showAuthModal}
      onSuccess={handleAuthSuccess}
      onClose={handleAuthClose}
    />
  </>
  );
}