import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AppProvider } from '../components/context';

/**
 * TgNetBucket 应用程序入口组件
 * 
 * 功能说明：
 * - 全局样式导入
 * - 应用级上下文提供者
 * - 页面组件包装
 * 
 * @param {Object} props - 组件属性
 * @param {React.Component} props.Component - 当前页面组件
 * @param {Object} props.pageProps - 页面属性
 * @returns {JSX.Element} 应用程序组件
 */
export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}