/**
 * 管理面板 Hook
 * 提供管理面板的状态管理和业务逻辑
 */
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { createSuccessMessage, createErrorMessage } from '../components/ui/Message';
import { createConfirmDialog } from '../components/ui/Modal';

/**
 * 管理面板 Hook
 * @returns {Object} 管理面板状态和方法
 */
export function useAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [activityLogs, setActivityLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 获取系统统计信息
   * @returns {Promise<void>}
   */
  const fetchSystemStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setSystemStats(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取系统统计失败:', error);
      createErrorMessage('获取系统统计失败');
    }
  }, []);

  /**
   * 获取系统状态信息
   * @returns {Promise<void>}
   */
  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/status');
      setSystemStatus(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取系统状态失败:', error);
      createErrorMessage('获取系统状态失败');
    }
  }, []);

  /**
   * 获取活动日志
   * @returns {Promise<void>}
   */
  const fetchActivityLogs = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/activity-logs?limit=50');
      setActivityLogs(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('获取活动日志失败:', error);
      createErrorMessage('获取活动日志失败');
    }
  }, []);

  /**
   * 清理过期的短链接
   * @returns {Promise<boolean>} 是否清理成功
   */
  const cleanupShortLinks = useCallback(async () => {
    const confirmed = await createConfirmDialog('确定要清理所有旧的短链接数据吗？');
    if (!confirmed) return false;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/cleanup-short-links');
      createSuccessMessage(`清理完成：扫描 ${response.data.scannedCount} 个键，删除 ${response.data.deletedCount} 个短链接`);
      await fetchSystemStats(); // 刷新统计
      return true;
    } catch (error) {
      createErrorMessage(`清理失败: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSystemStats]);

  /**
   * 同步文件列表
   * @returns {Promise<boolean>} 是否同步成功
   */
  const syncFiles = useCallback(async () => {
    const confirmed = await createConfirmDialog('确定要从Telegram重新同步文件列表吗？');
    if (!confirmed) return false;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/sync-files');
      createSuccessMessage(`同步完成：处理 ${response.data.syncedCount} 个文件`);
      await fetchSystemStats(); // 刷新统计
      return true;
    } catch (error) {
      createErrorMessage(`同步失败: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSystemStats]);

  /**
   * 备份数据库
   * @returns {Promise<boolean>} 是否备份成功
   */
  const backupDatabase = useCallback(async () => {
    const confirmed = await createConfirmDialog('确定要备份数据库吗？');
    if (!confirmed) return false;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/backup');
      createSuccessMessage(`备份完成：${response.data.message || '数据库备份成功'}`);
      if (response.data.data) {
        createSuccessMessage(`备份完成：${response.data.data.filename} (${response.data.data.keysCount} 个键)`);
      }
      return true;
    } catch (error) {
      createErrorMessage(`备份失败: ${error.response?.data?.error || error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新所有数据
   * @returns {Promise<void>}
   */
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSystemStats(),
        fetchSystemStatus(),
        fetchActivityLogs()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchSystemStats, fetchSystemStatus, fetchActivityLogs]);

  /**
   * 切换标签页
   * @param {string} tab - 标签页名称
   */
  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // 初始化时获取数据
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  return {
    // 状态
    activeTab,
    systemStats,
    systemStatus,
    activityLogs,
    loading,
    
    // 方法
    fetchSystemStats,
    fetchSystemStatus,
    fetchActivityLogs,
    cleanupShortLinks,
    syncFiles,
    backupDatabase,
    refreshAllData,
    switchTab,
    
    // 计算属性
    hasSystemStats: !!systemStats,
    hasSystemStatus: !!systemStatus,
    hasActivityLogs: !!activityLogs,
  };
}