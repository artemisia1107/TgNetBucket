/**
 * 系统设置管理 Hook
 * 提供系统设置的状态管理和业务逻辑
 */
import { useState, useCallback } from 'react';
import axios from 'axios';
import { createSuccessMessage, createErrorMessage } from '../components/ui/Message';
import { createConfirmDialog } from '../components/ui/Modal';

/**
 * 默认设置配置
 */
const DEFAULT_SETTINGS = {
  systemName: 'TgNetBucket',
  maxFileSize: 100,
  enableFileUpload: true,
  enableAccessLog: true,
  enableIPRestriction: false,
  shortLinkExpireDays: 30,
  telegramBotToken: '',
  telegramChatId: '',
  enableTelegramNotification: false,
  imageInteractionStyle: 'fade',
  animationSpeed: 'normal',
  interactionEnabled: true
};

/**
 * 系统设置管理 Hook
 * @param {Function} addNotification - 添加通知的回调函数
 * @returns {Object} 设置状态和方法
 */
export function useSettings(addNotification) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  /**
   * 更新单个设置项
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // 处理图片交互样式的DOM操作
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      switch (key) {
        case 'imageInteractionStyle':
          root.setAttribute('data-image-interaction', value);
          localStorage.setItem('imageInteractionStyle', value);
          createSuccessMessage(`图片交互样式已切换为: ${value === 'fade' ? '淡入淡出效果' : '下划线效果'}`);
          break;
        case 'animationSpeed':
          root.setAttribute('data-animation-speed', value);
          localStorage.setItem('animationSpeed', value);
          break;
        case 'interactionEnabled':
          root.setAttribute('data-interaction-enabled', value.toString());
          localStorage.setItem('interactionEnabled', value.toString());
          break;
      }
    }
  }, []);

  /**
   * 批量更新设置
   * @param {Object} newSettings - 新的设置对象
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  /**
   * 保存系统设置
   * @returns {Promise<boolean>} 是否保存成功
   */
  const saveSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/admin/settings', settings);
      
      if (response.data.success) {
        createSuccessMessage('设置保存成功');
        addNotification?.({
          type: 'success',
          title: '设置已保存',
          message: '系统设置已成功更新'
        });
        return true;
      } else {
        throw new Error(response.data.error || '保存失败');
      }
    } catch (error) {
      createErrorMessage(`保存设置失败: ${error.message}`);
      addNotification?.({
        type: 'error',
        title: '保存失败',
        message: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [settings, addNotification]);

  /**
   * 重置系统设置
   * @returns {Promise<boolean>} 是否重置成功
   */
  const resetSettings = useCallback(async () => {
    const confirmed = await createConfirmDialog('确定要重置所有设置到默认值吗？');
    if (!confirmed) return false;
    
    setSettings(DEFAULT_SETTINGS);
    createSuccessMessage('设置已重置为默认值');
    addNotification?.({
      type: 'info',
      title: '设置已重置',
      message: '所有设置已恢复为默认值'
    });
    return true;
  }, [addNotification]);

  /**
   * 导出配置
   * @param {Object} additionalData - 额外的配置数据
   */
  const exportConfig = useCallback((additionalData = {}) => {
    const configData = {
      settings,
      ...additionalData,
      exportTime: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tgnetbucket-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    createSuccessMessage('配置文件已导出');
    addNotification?.({
      type: 'success',
      title: '配置已导出',
      message: '配置文件已成功下载'
    });
  }, [settings, addNotification]);

  /**
   * 导入配置
   * @param {File} file - 配置文件
   * @returns {Promise<boolean>} 是否导入成功
   */
  const importConfig = useCallback(async (file) => {
    try {
      const text = await file.text();
      const configData = JSON.parse(text);
      
      if (configData.settings) {
        const confirmed = await createConfirmDialog('确定要导入配置文件吗？这将覆盖当前设置。');
        if (!confirmed) return false;
        
        setSettings(prev => ({
          ...prev,
          ...configData.settings
        }));
        
        createSuccessMessage('配置文件导入成功');
        addNotification?.({
          type: 'success',
          title: '配置已导入',
          message: '配置文件已成功导入'
        });
        return true;
      } else {
        throw new Error('配置文件格式不正确');
      }
    } catch (error) {
      createErrorMessage(`导入配置失败: ${error.message}`);
      addNotification?.({
        type: 'error',
        title: '导入失败',
        message: error.message
      });
      return false;
    }
  }, [addNotification]);

  /**
   * 加载设置
   * @returns {Promise<boolean>} 是否加载成功
   */
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data.data
        }));
        return true;
      } else {
        throw new Error(response.data.error || '加载失败');
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      // 使用默认设置，不显示错误消息
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 验证设置
   * @returns {Object} 验证结果
   */
  const validateSettings = useCallback(() => {
    const errors = [];
    
    if (!settings.systemName || settings.systemName.trim().length === 0) {
      errors.push('系统名称不能为空');
    }
    
    if (settings.maxFileSize <= 0 || settings.maxFileSize > 1000) {
      errors.push('最大文件大小必须在1-1000MB之间');
    }
    
    if (settings.shortLinkExpireDays <= 0 || settings.shortLinkExpireDays > 365) {
      errors.push('短链接过期时间必须在1-365天之间');
    }
    
    if (settings.enableTelegramNotification) {
      if (!settings.telegramBotToken || settings.telegramBotToken.trim().length === 0) {
        errors.push('启用Telegram通知时，Bot Token不能为空');
      }
      if (!settings.telegramChatId || settings.telegramChatId.trim().length === 0) {
        errors.push('启用Telegram通知时，Chat ID不能为空');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [settings]);

  /**
   * 初始化图片交互样式设置
   * 从localStorage恢复设置并应用到DOM
   */
  const initializeImageInteraction = useCallback(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // 从localStorage恢复设置
      const savedStyle = localStorage.getItem('imageInteractionStyle');
      const savedSpeed = localStorage.getItem('animationSpeed');
      const savedEnabled = localStorage.getItem('interactionEnabled');

      if (savedStyle) {
        setSettings(prev => ({ ...prev, imageInteractionStyle: savedStyle }));
        root.setAttribute('data-image-interaction', savedStyle);
      }

      if (savedSpeed) {
        setSettings(prev => ({ ...prev, animationSpeed: savedSpeed }));
        root.setAttribute('data-animation-speed', savedSpeed);
      }

      if (savedEnabled !== null) {
        const enabled = savedEnabled === 'true';
        setSettings(prev => ({ ...prev, interactionEnabled: enabled }));
        root.setAttribute('data-interaction-enabled', enabled.toString());
      }
    }
  }, []);

  return {
    // 状态
    settings,
    loading,
    
    // 方法
    updateSetting,
    updateSettings,
    saveSettings,
    resetSettings,
    exportConfig,
    importConfig,
    loadSettings,
    validateSettings,
    initializeImageInteraction,
    
    // 计算属性
    hasChanges: JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS),
    isValid: validateSettings().isValid,
    validationErrors: validateSettings().errors
  };
}