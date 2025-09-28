/**
 * 页面认证守卫组件
 * 在页面加载时检查认证状态，未认证时显示认证弹窗
 */

import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import { getAuthStatus, setAuthSession } from '../utils/authUtils';
import { AUTH_CONFIG } from '../constants/config';

/**
 * 页面认证守卫组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {boolean} props.requireAuth - 是否需要认证，默认为 true
 * @param {string} props.redirectTo - 认证失败时重定向的路径，默认不重定向
 * @param {Function} props.onAuthSuccess - 认证成功回调
 * @param {Function} props.onAuthFailure - 认证失败回调
 * @returns {JSX.Element} 页面认证守卫组件
 */
const PageAuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = null,
  onAuthSuccess = null,
  onAuthFailure = null 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 检查认证状态
   */
  const checkAuthentication = () => {
    const authStatus = getAuthStatus();
    const authenticated = authStatus === AUTH_CONFIG.STATUS.AUTHENTICATED;
    
    setIsAuthenticated(authenticated);
    
    if (requireAuth && !authenticated) {
      setShowAuthModal(true);
    }
    
    setIsLoading(false);
    return authenticated;
  };

  /**
   * 处理认证成功
   * @param {Object} authData - 认证数据，包含用户名、密码或令牌
   */
  const handleAuthSuccess = async (authData) => {
    try {
      // 如果传入的是用户名和密码，设置认证会话
      if (authData.username && authData.password) {
        const sessionSet = await setAuthSession(authData.username, authData.password);
        if (!sessionSet) {
          console.error('Failed to set auth session');
          return;
        }
      }
      
      setIsAuthenticated(true);
      setShowAuthModal(false);
      
      // 调用成功回调
      if (onAuthSuccess) {
        onAuthSuccess(authData.token || authData);
      }
    } catch (error) {
      console.error('Error handling auth success:', error);
    }
  };

  /**
   * 处理认证弹窗关闭
   */
  const handleAuthClose = () => {
    if (requireAuth && !isAuthenticated) {
      // 如果需要认证但用户未认证，根据配置处理
      if (redirectTo) {
        // 重定向到指定页面
        window.location.href = redirectTo;
      } else {
        // 调用失败回调
        if (onAuthFailure) {
          onAuthFailure();
        } else {
          // 默认重定向到首页
          window.location.href = '/';
        }
      }
    } else {
      setShowAuthModal(false);
    }
  };



  // 页面加载时检查认证状态
  useEffect(() => {
    checkAuthentication();
  }, [requireAuth, checkAuthentication]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="page-auth-loading">
        <div className="loading-spinner"></div>
        <p>正在验证身份...</p>
        
        <style jsx>{`
          .page-auth-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            padding: 40px;
            text-align: center;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .page-auth-loading p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  // 如果需要认证但未认证，只显示认证弹窗
  if (requireAuth && !isAuthenticated) {
    return (
      <>
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          title="页面访问需要认证"
          message="请输入管理员用户名和密码以访问此页面"
        />
      </>
    );
  }

  // 认证通过或不需要认证，显示子组件
  return (
    <>
      {children}
      
      {/* 认证弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        title="重新认证"
        message="会话已过期，请重新输入用户名和密码"
      />
    </>
  );
};

export default PageAuthGuard;