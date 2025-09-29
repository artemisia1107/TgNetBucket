/**
 * 认证工具函数
 * 提供用户认证、会话管理等功能
 */

import { AUTH_CONFIG } from '../constants/config.js';

/**
 * 获取管理员凭据
 * 按优先级从不同来源获取：Vercel环境变量 -> .env.local -> Upstash Redis
 * @returns {Promise<{username: string, password: string}>}
 */
export async function getAdminCredentials() {
  try {
    // 1. 优先从环境变量获取
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;
    
    if (envUsername && envPassword) {
      return { username: envUsername, password: envPassword };
    }
    
    // 2. 从 Redis 获取（如果配置了 Redis）
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { getRedisClient } = await import('../src/redis_client.js');
        const redis = getRedisClient();
        
        const redisUsername = await redis.get('admin:username');
        const redisPassword = await redis.get('admin:password');
        
        if (redisUsername && redisPassword) {
          return { username: redisUsername, password: redisPassword };
        }
      } catch (redisError) {
        console.warn('Failed to get credentials from Redis:', redisError.message);
      }
    }
    
    // 3. 默认值（仅用于开发环境）
    return {
      username: 'admin',
      password: 'admin123'
    };
  } catch (error) {
    console.error('Error getting admin credentials:', error);
    throw new Error('Failed to retrieve admin credentials');
  }
}

/**
 * 验证管理员凭据
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<boolean>}
 */
export async function validateAdminCredentials(username, password) {
  try {
    if (!username || !password) {
      return false;
    }
    
    const credentials = await getAdminCredentials();
    return username === credentials.username && password === credentials.password;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
}

/**
 * 生成认证令牌
 * @param {string} username - 用户名
 * @returns {string}
 */
export function generateAuthToken(username) {
  const timestamp = Date.now();
  const payload = { username, timestamp };
  
  // 简单的 Base64 编码（生产环境应使用 JWT）
  return btoa(JSON.stringify(payload));
}

/**
 * 验证认证令牌
 * @param {string} token - 认证令牌
 * @returns {boolean}
 */
export function validateAuthToken(token) {
  try {
    if (!token) return false;
    
    const payload = JSON.parse(atob(token));
    const { timestamp } = payload;
    
    // 检查令牌是否过期
    const now = Date.now();
    const isExpired = (now - timestamp) > AUTH_CONFIG.SESSION.DURATION;
    
    return !isExpired;
  } catch (error) {
    return false;
  }
}

/**
 * 获取当前认证状态
 * @returns {string} 认证状态
 */
export function getAuthStatus() {
  if (typeof window === 'undefined') {
    return AUTH_CONFIG.STATUS.UNAUTHENTICATED;
  }
  
  const token = localStorage.getItem(AUTH_CONFIG.SESSION.STORAGE_KEY);
  
  if (!token) {
    return AUTH_CONFIG.STATUS.UNAUTHENTICATED;
  }
  
  if (validateAuthToken(token)) {
    return AUTH_CONFIG.STATUS.AUTHENTICATED;
  } else {
    // 清除过期令牌
    localStorage.removeItem(AUTH_CONFIG.SESSION.STORAGE_KEY);
    return AUTH_CONFIG.STATUS.EXPIRED;
  }
}

/**
 * 设置认证会话
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<boolean>}
 */
export async function setAuthSession(username, password) {
  try {
    const isValid = await validateAdminCredentials(username, password);
    
    if (!isValid) {
      return false;
    }
    
    const token = generateAuthToken(username);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.SESSION.STORAGE_KEY, token);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting auth session:', error);
    return false;
  }
}

/**
 * 清除认证会话
 */
export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_CONFIG.SESSION.STORAGE_KEY);
  }
}

/**
 * 检查是否需要认证
 * @returns {boolean}
 */
export function requiresAuth() {
  const status = getAuthStatus();
  return status !== AUTH_CONFIG.STATUS.AUTHENTICATED;
}

/**
 * 获取认证错误消息
 * @param {string} status - 认证状态
 * @returns {string}
 */
export function getAuthErrorMessage(status) {
  switch (status) {
    case AUTH_CONFIG.STATUS.EXPIRED:
      return AUTH_CONFIG.ERRORS.SESSION_EXPIRED;
    case AUTH_CONFIG.STATUS.UNAUTHENTICATED:
      return AUTH_CONFIG.ERRORS.AUTH_REQUIRED;
    default:
      return AUTH_CONFIG.ERRORS.ACCESS_DENIED;
  }
}

/**
 * 客户端认证检查 Hook
 * @returns {object} 认证状态和方法
 */
export function useAuth() {
  // 动态导入React Hook
  let useState;
  if (typeof window !== 'undefined') {
    try {
      const React = require('react');
      useState = React.useState;
    } catch (error) {
      // React 未加载时的降级处理
      useState = () => [getAuthStatus(), () => {}];
    }
  } else {
    // 服务端环境的降级处理
    useState = () => [getAuthStatus(), () => {}];
  }
  
  const [authStatus, setAuthStatus] = useState(getAuthStatus());
  
  const login = async (username, password) => {
    const success = await setAuthSession(username, password);
    if (success) {
      setAuthStatus(AUTH_CONFIG.STATUS.AUTHENTICATED);
    }
    return success;
  };
  
  const logout = () => {
    clearAuthSession();
    setAuthStatus(AUTH_CONFIG.STATUS.UNAUTHENTICATED);
  };
  
  const checkAuth = () => {
    const status = getAuthStatus();
    setAuthStatus(status);
    return status === AUTH_CONFIG.STATUS.AUTHENTICATED;
  };
  
  return {
    isAuthenticated: authStatus === AUTH_CONFIG.STATUS.AUTHENTICATED,
    authStatus,
    login,
    logout,
    checkAuth,
    requiresAuth: requiresAuth()
  };
}