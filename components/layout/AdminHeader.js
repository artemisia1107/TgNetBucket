/**
 * AdminHeader 组件
 * 提供管理面板的侧边栏导航和顶部操作栏
 */
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
 * @returns {JSX.Element} AdminHeader 组件
 */
export default function AdminHeader({
  activeTab = 'overview',
  onTabChange,
  isMobileMenuOpen = false,
  toggleMobileMenu,
  closeMobileMenu,
  onRefresh,
  loading = false
}) {

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
    <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-icon"><i className="fas fa-rocket"></i></div>
          <div className="sidebar-info">
            <h2 className="sidebar-title">TgNetBucket</h2>
            <span className="sidebar-subtitle">管理面板</span>
          </div>
        </div>
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
              >
                <span className="sidebar-nav-icon"><i className={item.icon}></i></span>
                <div className="sidebar-nav-content">
                  <span className="sidebar-nav-title">{item.title}</span>
                  <span className="sidebar-nav-description">{item.description}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <Link href="/" className="sidebar-back-link">
          <span className="sidebar-back-icon"><i className="fas fa-home"></i></span>
          <span className="sidebar-back-text">返回首页</span>
        </Link>
      </div>
    </aside>
  );

  /**
   * 渲染顶部操作栏
   * @returns {JSX.Element} 操作栏组件
   */
  const renderTopBar = () => (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="page-title">
          {menuItems.find(item => item.id === activeTab)?.title || '管理面板'}
        </h1>
        <span className="page-subtitle">
          {menuItems.find(item => item.id === activeTab)?.description || '系统管理'}
        </span>
      </div>
      
      <div className="admin-header-actions">
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
            <i className={loading ? 'fas fa-hourglass-half' : 'fas fa-sync'}></i>
          </span>
        </button>
      </div>
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
        <span className="sidebar-toggle-icon"><i className="fas fa-bars"></i></span>
      </button>

      {/* 移动端遮罩层 */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      {/* 侧边栏导航 */}
      {renderSidebar()}

      {/* 顶部操作栏 */}
      {renderTopBar()}
    </>
  );
}