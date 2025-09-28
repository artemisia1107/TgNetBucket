/**
 * Header 组件
 * 提供统一的页面头部导航栏
 * 支持不同页面的自定义配置
 */
import Link from 'next/link';

/**
 * Header 组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 页面标题
 * @param {string} props.subtitle - 页面副标题
 * @param {string} props.currentPage - 当前页面标识 ('home' | 'admin')
 * @param {Array} props.breadcrumbs - 面包屑导航数组
 * @param {Array} props.actions - 快速操作按钮数组
 * @param {Function} props.onUpload - 上传文件回调函数
 * @param {Function} props.onRefresh - 刷新数据回调函数
 * @returns {JSX.Element} Header 组件
 */
export default function Header({ 
  title = "TgNetBucket", 
  subtitle = "现代化文件存储",
  currentPage = "home",
  breadcrumbs = [],
  actions = [],
  onUpload,
  onRefresh
}) {
  
  /**
   * 渲染面包屑导航
   * @returns {JSX.Element} 面包屑组件
   */
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-item active">
            <span className="breadcrumb-icon"><i className="fas fa-home"></i></span>
            {currentPage === 'admin' ? '管理面板' : '文件管理'}
          </span>
        </div>
      );
    }

    return (
      <div className="breadcrumb">
        {breadcrumbs.map((item, index) => (
          <span 
            key={index} 
            className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
          >
            {item.icon && <span className="breadcrumb-icon"><i className={item.icon}></i></span>}
            {item.href ? (
              <a href={item.href}>{item.text}</a>
            ) : (
              item.text
            )}
            {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">›</span>}
          </span>
        ))}
      </div>
    );
  };

  /**
   * 渲染快速操作按钮
   * @returns {JSX.Element} 操作按钮组件
   */
  const renderActions = () => {
    const defaultActions = currentPage === 'home' ? [
      {
        key: 'upload',
        icon: 'fas fa-upload',
        text: '上传',
        title: '快速上传',
        onClick: onUpload || (() => document.querySelector('input[type="file"]')?.click())
      },
      {
        key: 'refresh',
        icon: 'fas fa-sync',
        text: '刷新',
        title: '刷新列表',
        onClick: onRefresh || (() => window.location.reload())
      }
    ] : [];

    const allActions = [...defaultActions, ...actions];

    return (
      <div className="nav-actions">
        <div className="quick-actions">
          {allActions.map((action) => (
            <button 
              key={action.key}
              className="quick-action-btn"
              onClick={action.onClick}
              title={action.title}
              disabled={action.disabled}
            >
              <span className="action-icon"><i className={action.icon}></i></span>
              <span className="action-text">{action.text}</span>
            </button>
          ))}
        </div>
        
        {currentPage === 'home' && (
          <>
            <div className="nav-divider"></div>
            <Link href="/admin" className="admin-link">
              <span className="admin-icon"><i className="fas fa-cog"></i></span>
              <span className="admin-text">管理面板</span>
            </Link>
          </>
        )}
        
        {currentPage === 'admin' && (
          <>
            <div className="nav-divider"></div>
            <Link href="/" className="home-link">
              <span className="home-icon"><i className="fas fa-home"></i></span>
              <span className="home-text">返回首页</span>
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h1><i className="fas fa-box"></i> {title}</h1>
          <span className="nav-subtitle">{subtitle}</span>
        </div>
        
        {renderBreadcrumbs()}
        {renderActions()}
      </div>
    </nav>
  );
}