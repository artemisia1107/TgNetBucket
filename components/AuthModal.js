/**
 * 认证弹窗组件
 * 提供管理员登录界面
 */

import React, { useState, useEffect } from 'react';
import { AUTH_CONFIG } from '../constants/config.js';

/**
 * 认证弹窗组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示弹窗
 * @param {Function} props.onClose - 关闭弹窗回调
 * @param {Function} props.onSuccess - 认证成功回调
 * @param {string} props.title - 弹窗标题
 * @param {string} props.message - 提示消息
 * @param {string} props.redirectTo - 登录成功后重定向的URL
 */
const AuthModal = ({ 
  isOpen = false, 
  onClose, 
  onSuccess, 
  title = '管理员认证',
  message = '请输入管理员用户名和密码以继续操作',
  redirectTo = null
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 重置表单状态
  useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', password: '' });
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  /**
   * 处理输入变化
   * @param {Event} e - 输入事件
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  /**
   * 处理表单提交
   * @param {Event} e - 提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 保存认证令牌
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_CONFIG.SESSION.STORAGE_KEY, result.token);
        }
        
        // 如果指定了重定向URL，则立即进行页面跳转
        if (redirectTo && typeof window !== 'undefined') {
          window.location.href = redirectTo;
          return; // 立即返回，避免执行后续代码
        }
        
        // 调用成功回调，传递完整的认证数据
        if (onSuccess) {
          onSuccess({
            username: formData.username,
            password: formData.password,
            token: result.token
          });
        }
        
        // 关闭弹窗
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.error || '认证失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理键盘事件
   * @param {KeyboardEvent} e - 键盘事件
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  // 如果弹窗未打开，不渲染
  if (!isOpen) return null;

  return (
    <div 
      className="auth-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">{title}</h2>
          {onClose && (
            <button 
              className="auth-modal-close"
              onClick={onClose}
              type="button"
              aria-label="关闭"
            >
              ×
            </button>
          )}
        </div>

        <div className="auth-modal-body">
          {message && (
            <p className="auth-modal-message">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="username" className="auth-form-label">
                用户名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="auth-form-input"
                placeholder="请输入管理员用户名"
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-form-label">
                密码
              </label>
              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="auth-form-input"
                  placeholder="请输入管理员密码"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-form-actions">
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !formData.username || !formData.password}
              >
                {loading ? '验证中...' : '登录'}
              </button>
              {onClose && (
                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .auth-modal {
          background: var(--bg-primary, #ffffff);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 400px;
          max-height: 90vh;
          overflow: hidden;
          border: 1px solid var(--border-color, #e1e5e9);
        }

        .auth-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--border-color, #e1e5e9);
        }

        .auth-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #1a1a1a);
        }

        .auth-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary, #666);
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .auth-modal-close:hover {
          background: var(--bg-secondary, #f5f5f5);
          color: var(--text-primary, #1a1a1a);
        }

        .auth-modal-body {
          padding: 24px;
        }

        .auth-modal-message {
          margin: 0 0 20px;
          color: var(--text-secondary, #666);
          font-size: 14px;
          line-height: 1.5;
        }

        .auth-form-group {
          margin-bottom: 16px;
        }

        .auth-form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: var(--text-primary, #1a1a1a);
          font-size: 14px;
        }

        .auth-form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color, #e1e5e9);
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #1a1a1a);
          box-sizing: border-box;
        }

        .auth-form-input:focus {
          outline: none;
          border-color: var(--primary-color, #007bff);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .auth-form-input:disabled {
          background: var(--bg-secondary, #f5f5f5);
          cursor: not-allowed;
        }

        .auth-password-wrapper {
          position: relative;
        }

        .auth-password-wrapper .auth-form-input {
          padding-right: 48px;
        }

        .auth-password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 16px;
          transition: background 0.2s ease;
        }

        .auth-password-toggle:hover {
          background: var(--bg-secondary, #f5f5f5);
        }

        .auth-password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .auth-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .auth-form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .auth-submit-btn,
        .auth-cancel-btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .auth-submit-btn {
          background: var(--primary-color, #007bff);
          color: white;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: var(--primary-hover, #0056b3);
        }

        .auth-submit-btn:disabled {
          background: var(--bg-secondary, #f5f5f5);
          color: var(--text-disabled, #999);
          cursor: not-allowed;
        }

        .auth-cancel-btn {
          background: var(--bg-secondary, #f5f5f5);
          color: var(--text-secondary, #666);
          border: 1px solid var(--border-color, #e1e5e9);
        }

        .auth-cancel-btn:hover:not(:disabled) {
          background: var(--bg-tertiary, #e9ecef);
          color: var(--text-primary, #1a1a1a);
        }

        .auth-cancel-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .auth-modal {
            width: 95%;
            margin: 20px;
          }

          .auth-modal-header,
          .auth-modal-body {
            padding: 16px 20px;
          }

          .auth-form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;