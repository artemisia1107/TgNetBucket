/**
 * AdminHeader 组件
 * 提供管理面板的侧边栏导航和顶部操作栏
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * AdminHeader 组件
 * @param {Object} props - 组件属性
 * @param {string} props.activeTab - 当前激活的标签页
 * @param {Function} props.onTabChange - 标签页切换回调
 * @param {boolean} props.isMobileMenuOpen - 移动端菜单是否打开
 * @param {Function} props.toggleMobileMenu - 切换移动端菜单
 * @param {Function} props.closeMobileMenu - 关闭移动端菜单
 * @param {Function} props.onRefresh - 刷新数据回调
 * @param {boolean} props.loading - 是否正在加载
 * @param {boolean} props.isSidebarCollapsed - 侧边栏是否折叠
 * @param {Function} props.toggleSidebar - 切换侧边栏折叠状态
 * @param {Object} props.systemStats - 系统统计信息
 * @param {Array} props.notifications - 通知列表
 * @param {Function} props.onLogout - 登出回调
 * @returns {JSX.Element} AdminHeader 组件
 */
export default function AdminHeader({
  activeTab = 'overview',
  onTabChange,
  isMobileMenuOpen = false,
  toggleMobileMenu,
  closeMobileMenu,
  onRefresh,
  loading = false,
  isSidebarCollapsed = false,
  toggleSidebar,
  systemStats = null,
  notifications = [],
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown') && !event.target.closest('.notification-trigger')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-menu-dropdown') && !event.target.closest('.user-menu-trigger')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  /**
   * 导航菜单配置
   */
  const menuItems = [
    {
      id: 'overview',
      icon: 'fas fa-chart-bar',
      title: '概览',
      description: '系统状态'
    },
    {
      id: 'database',
      icon: 'fas fa-database',
      title: '数据库',
      description: '文件管理'
    },
    {
      id: 'logs',
      icon: 'fas fa-clipboard-list',
      title: '日志',
      description: '操作记录'
    },
    {
      id: 'settings',
      icon: 'fas fa-cog',
      title: '设置',
      description: '系统配置'
    }
  ];

  /**
   * 渲染侧边栏导航
   * @returns {JSX.Element} 侧边栏组件
   */
  const renderSidebar = () => (
    <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-icon"><i className="fas fa-rocket" /></div>
          {!isSidebarCollapsed && (
            <div className="sidebar-info">
              <h2 className="sidebar-title">TgNetBucket</h2>
              <span className="sidebar-subtitle">管理面板</span>
            </div>
          )}
        </div>
        
        {/* 侧边栏折叠按钮 */}
        <button
          className="sidebar-collapse-toggle"
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          title={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar-nav-item">
              <button
                className={`sidebar-nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  onTabChange?.(item.id);
                  closeMobileMenu?.();
                }}
                title={isSidebarCollapsed ? item.title : ''}
              >
                <span className="sidebar-nav-icon"><i className={item.icon} /></span>
                {!isSidebarCollapsed && (
                  <div className="sidebar-nav-content">
                    <span className="sidebar-nav-title">{item.title}</span>
                    <span className="sidebar-nav-description">{item.description}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 系统状态指示器 */}
      {!isSidebarCollapsed && systemStats && (
        <div className="sidebar-status">
          <div className="status-item">
            <span className="status-label">文件总数</span>
            <span className="status-value">{systemStats.totalFiles || 0}</span>
          </div>
          <div className="status-item">
            <span className="status-label">存储使用</span>
            <span className="status-value">{systemStats.totalSizeFormatted || '0 B'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">系统状态</span>
            <span className={`status-indicator ${systemStats.status === 'healthy' ? 'healthy' : 'warning'}`}>
              <i className={`fas ${systemStats.status === 'healthy' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} />
              {systemStats.status === 'healthy' ? '正常' : '警告'}
            </span>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <Link href="/" className="sidebar-back-link" title="返回首页">
          <span className="sidebar-back-icon"><i className="fas fa-home" /></span>
          {!isSidebarCollapsed && <span className="sidebar-back-text">返回首页</span>}
        </Link>
      </div>
    </aside>
  );

  /**
   * 渲染通知下拉菜单
   * @returns {JSX.Element} 通知菜单组件
   */
  const renderNotificationDropdown = () => (
    <div className={`notification-dropdown ${showNotifications ? 'show' : ''}`}>
      <div className="notification-header">
        <h3>通知</h3>
        <span className="notification-count">{notifications.length}</span>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification, index) => (
            <div key={index} className={`notification-item ${notification.type || 'info'}`}>
              <div className="notification-icon">
                <i className={`fas ${
                  notification.type === 'error' ? 'fa-exclamation-circle' :
                  notification.type === 'warning' ? 'fa-exclamation-triangle' :
                  notification.type === 'success' ? 'fa-check-circle' :
                  'fa-info-circle'
                }`} />
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{notification.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="notification-empty">
            <i className="fas fa-bell-slash" />
            <span>暂无通知</span>
          </div>
        )}
      </div>
      {notifications.length > 5 && (
        <div className="notification-footer">
          <button className="view-all-btn">查看全部通知</button>
        </div>
      )}
    </div>
  );

  /**
   * 渲染用户菜单下拉
   * @returns {JSX.Element} 用户菜单组件
   */
  const renderUserMenuDropdown = () => (
    <div className={`user-menu-dropdown ${showUserMenu ? 'show' : ''}`}>
      <div className="user-menu-header">
        <div className="user-avatar">
          <i className="fas fa-user-circle" />
        </div>
        <div className="user-info">
          <div className="user-name">管理员</div>
          <div className="user-role">系统管理员</div>
        </div>
      </div>
      <div className="user-menu-list">
        <button className="user-menu-item">
          <i className="fas fa-user-cog" />
          <span>个人设置</span>
        </button>
        <button className="user-menu-item">
          <i className="fas fa-key" />
          <span>修改密码</span>
        </button>
        <button className="user-menu-item">
          <i className="fas fa-history" />
          <span>操作日志</span>
        </button>
        <div className="user-menu-divider" />
        <button className="user-menu-item logout" onClick={onLogout}>
          <i className="fas fa-sign-out-alt" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );

  /**
   * 渲染顶部操作栏
   * @returns {JSX.Element} 操作栏组件
   */
  const renderTopBar = () => (
    <header className={`admin-header ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="admin-header-left">
        <h1 className="page-title">
          {menuItems.find(item => item.id === activeTab)?.title || '管理面板'}
        </h1>
        <span className="page-subtitle">
          {menuItems.find(item => item.id === activeTab)?.description || '系统管理'}
        </span>
      </div>
      
      <div className="admin-header-actions">
        {/* 刷新按钮 */}
        <button
          className="header-action"
          onClick={() => {
            if (onRefresh) {
              onRefresh();
            }
          }}
          disabled={loading}
          title="刷新数据"
        >
          <span className={loading ? 'loading' : 'refresh'}>
            <i className={loading ? 'fas fa-hourglass-half' : 'fas fa-sync'} />
          </span>
        </button>

        {/* 通知按钮 */}
        <div className="notification-container">
          <button
            className={`header-action notification-trigger ${notifications.length > 0 ? 'has-notifications' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="通知"
          >
            <i className="fas fa-bell" />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length > 99 ? '99+' : notifications.length}</span>
            )}
          </button>
          {renderNotificationDropdown()}
        </div>

        {/* 用户菜单 */}
        <div className="user-menu-container">
          <button
            className="header-action user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="用户菜单"
          >
            <i className="fas fa-user-circle" />
          </button>
          {renderUserMenuDropdown()}
        </div>
      </div>
      <div className="admin-divider" />
    </header>
  );

  return (
    <>
      {/* 移动端菜单切换按钮 */}
      <button 
        className="sidebar-toggle"
        onClick={toggleMobileMenu}
        aria-label="切换菜单"
      >
        <span className="sidebar-toggle-icon"><i className="fas fa-bars" /></span>
      </button>

      {/* 移动端遮罩层 */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* 侧边栏导航 */}
      {renderSidebar()}

      {/* 顶部操作栏 */}
      {renderTopBar()}
    </>
  );
}