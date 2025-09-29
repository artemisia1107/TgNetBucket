/**
 * Footer 组件
 * 提供统一的页面底部信息
 * 支持自定义链接和版权信息
 */

/**
 * Footer 组件
 * @param {Object} props - 组件属性
 * @param {string} props.copyright - 版权信息
 * @param {Array} props.links - 底部链接数组
 * @param {boolean} props.showPoweredBy - 是否显示技术支持信息
 * @param {string} props.className - 自定义CSS类名
 * @returns {JSX.Element} Footer 组件
 */
export default function Footer({ 
  copyright = "© 2024 TgNetBucket. All rights reserved.",
  links = [],
  showPoweredBy = true,
  className = ""
}) {
  
  /**
   * 默认链接配置
   */
  const defaultLinks = [
    {
      text: "使用条款",
      href: "#",
      icon: "fas fa-clipboard"
    },
    {
      text: "隐私政策", 
      href: "#",
      icon: "fas fa-lock"
    },
    {
      text: "帮助中心",
      href: "#",
      icon: "fas fa-question-circle"
    },
    {
      text: "联系我们",
      href: "#",
      icon: "fas fa-envelope"
    }
  ];

  const allLinks = links.length > 0 ? links : defaultLinks;

  /**
   * 渲染底部链接
   * @returns {JSX.Element} 链接组件
   */
  const renderLinks = () => {
    if (allLinks.length === 0) {
      return null;
    }

    return (
      <div className="footer-links">
        {allLinks.map((link, index) => (
          <a 
            key={index}
            href={link.href}
            className="footer-link"
            target={link.external ? "_blank" : "_self"}
            rel={link.external ? "noopener noreferrer" : ""}
          >
            {link.icon && <span className="link-icon"><i className={link.icon} /></span>}
            <span className="link-text">{link.text}</span>
          </a>
        ))}
      </div>
    );
  };

  /**
   * 渲染技术支持信息
   * @returns {JSX.Element} 技术支持组件
   */
  const renderPoweredBy = () => {
    if (!showPoweredBy) {
      return null;
    }

    return (
      <div className="footer-powered">
        <span className="powered-text">Powered by</span>
        <span className="powered-tech">
          <span className="tech-item">Next.js</span>
          <span className="tech-separator">•</span>
          <span className="tech-item">Telegram Bot API</span>
          <span className="tech-separator">•</span>
          <span className="tech-item">Vercel</span>
        </span>
      </div>
    );
  };

  return (
    <footer className={`app-footer ${className}`}>
      <div className="footer-container">
        <div className="footer-content">
          {renderLinks()}
          
          <div className="footer-info">
            <div className="footer-copyright">
              <span className="copyright-text">{copyright}</span>
            </div>
            
            {renderPoweredBy()}
          </div>
        </div>
        
        <div className="footer-brand">
          <div className="brand-logo">
            <span className="brand-icon"><i className="fas fa-box" /></span>
            <span className="brand-name">TgNetBucket</span>
          </div>
          <div className="brand-tagline">
            现代化文件存储解决方案
          </div>
        </div>
      </div>
    </footer>
  );
}