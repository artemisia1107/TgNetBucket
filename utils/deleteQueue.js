/**
 * 删除队列管理器
 * 提供文件删除的队列机制，支持离线重试和失败恢复
 */

import { getNetworkMonitor } from './networkMonitor.js';

class DeleteQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.retryDelay = 5000; // 5秒重试延迟
    this.maxRetries = 3; // 最大重试次数
    this.storageKey = 'tg-delete-queue';
    this.networkQuality = 'unknown';
    
    // 初始化网络监控器
    this.networkMonitor = getNetworkMonitor();
    this.networkMonitor.addListener(this.handleNetworkStatusChange.bind(this));
    
    // 从本地存储恢复队列
    this.loadFromStorage();
    
    // 监听网络状态变化
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * 处理网络状态变化（来自网络监控器）
   * @param {Object} status - 网络状态对象
   */
  async handleNetworkStatusChange(status) {
    const wasOnline = this.isOnline();
    this.networkQuality = status.quality;

    console.log('网络状态变化:', {
      isOnline: status.isOnline,
      quality: this.networkQuality,
      wasOnline
    });

    if (status.isOnline && !wasOnline) {
      // 网络从离线变为在线
      console.log('网络已连接，开始处理删除队列');
      await this.processQueue();
    } else if (!status.isOnline && wasOnline) {
      // 网络从在线变为离线
      console.log('网络已断开，暂停处理删除队列');
    } else if (status.isOnline && this.networkQuality === 'excellent' && this.queue.length > 0) {
      // 网络质量改善，可以加速处理
      console.log('网络质量改善，加速处理删除队列');
      await this.processQueue();
    }
  }

  /**
   * 处理网络连接事件（备用机制）
   */
  async handleOnline() {
    console.log('网络已连接（备用检测），开始处理删除队列');
    await this.processQueue();
  }

  /**
   * 处理网络断开事件（备用机制）
   */
  handleOffline() {
    console.log('网络已断开（备用检测），暂停处理删除队列');
  }

  /**
   * 添加删除任务到队列
   * @param {string} fileId - 文件ID
   * @param {object} fileInfo - 文件信息
   * @param {function} onSuccess - 成功回调
   * @param {function} onError - 错误回调
   */
  async addDeleteTask(fileId, fileInfo, onSuccess, onError) {
    const task = {
      id: `delete_${fileId}_${Date.now()}`,
      fileId,
      fileInfo,
      onSuccess,
      onError,
      retries: 0,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, processing, completed, failed
    };

    this.queue.push(task);
    this.saveToStorage();
    
    console.log(`添加删除任务到队列: ${fileInfo.name} (${fileId})`);
    
    // 如果当前在线且未在处理，立即开始处理
    if (this.isOnline() && !this.processing) {
      await this.processQueue();
    }
    
    return task.id;
  }

  /**
   * 处理删除队列
   */
  async processQueue() {
    if (this.processing || !this.isOnline()) {
      return;
    }

    this.processing = true;
    console.log(`开始处理删除队列，共 ${this.queue.length} 个任务`);

    while (this.queue.length > 0) {
      const task = this.queue[0];
      
      if (task.status === 'completed') {
        this.queue.shift();
        continue;
      }

      if (task.status === 'failed' && task.retries >= this.maxRetries) {
        console.log(`任务 ${task.id} 已达到最大重试次数，移除队列`);
        this.queue.shift();
        this.saveToStorage();
        
        if (task.onError) {
          task.onError(new Error('删除失败：已达到最大重试次数'));
        }
        continue;
      }

      try {
        task.status = 'processing';
        task.retries++;
        this.saveToStorage();
        
        console.log(`处理删除任务: ${task.fileInfo.name} (重试 ${task.retries}/${this.maxRetries})`);
        
        // 执行删除操作
        await this.executeDelete(task);
        
        // 删除成功
        task.status = 'completed';
        this.queue.shift();
        this.saveToStorage();
        
        console.log(`删除任务完成: ${task.fileInfo.name}`);
        
        if (task.onSuccess) {
          task.onSuccess();
        }
        
      } catch (error) {
        console.error(`删除任务失败: ${task.fileInfo.name}`, error);
        
        task.status = 'failed';
        task.lastError = error.message;
        task.lastAttempt = new Date().toISOString();
        this.saveToStorage();
        
        // 如果还有重试机会，等待后继续
        if (task.retries < this.maxRetries) {
          console.log(`任务 ${task.id} 将在 ${this.retryDelay}ms 后重试`);
          await this.delay(this.retryDelay);
          
          // 检查网络状态
          if (!this.isOnline()) {
            console.log('网络已断开，暂停队列处理');
            break;
          }
        } else {
          // 达到最大重试次数
          this.queue.shift();
          this.saveToStorage();
          
          if (task.onError) {
            task.onError(error);
          }
        }
      }
    }

    this.processing = false;
    console.log('删除队列处理完成');
  }

  /**
   * 执行删除操作
   * @param {object} task - 删除任务
   */
  async executeDelete(task) {
    const response = await fetch(`/api/files/${task.fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '删除操作失败');
    }
    
    return result;
  }

  /**
   * 检查网络连接状态
   * @returns {boolean} 是否在线
   */
  isOnline() {
    // 优先使用网络监控器的状态
    if (this.networkMonitor) {
      const status = this.networkMonitor.getStatus();
      return status.isOnline && status.quality !== 'poor';
    }
    
    // 备用检查
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true; // 服务器端默认认为在线
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 保存队列到本地存储
   */
  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        // 只保存必要的数据，不保存回调函数
        const queueData = this.queue.map(task => ({
          id: task.id,
          fileId: task.fileId,
          fileInfo: task.fileInfo,
          retries: task.retries,
          createdAt: task.createdAt,
          status: task.status,
          lastError: task.lastError,
          lastAttempt: task.lastAttempt
        }));
        
        localStorage.setItem(this.storageKey, JSON.stringify(queueData));
      } catch (error) {
        console.warn('保存删除队列到本地存储失败:', error);
      }
    }
  }

  /**
   * 从本地存储加载队列
   */
  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const queueData = JSON.parse(stored);
          this.queue = queueData.filter(task => 
            task.status !== 'completed' && 
            task.retries < this.maxRetries
          );
          console.log(`从本地存储恢复 ${this.queue.length} 个删除任务`);
        }
      } catch (error) {
        console.warn('从本地存储加载删除队列失败:', error);
        this.queue = [];
      }
    }
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.queue = [];
    this.saveToStorage();
    console.log('删除队列已清空');
  }

  /**
   * 获取队列状态
   * @returns {object} 队列状态信息
   */
  getQueueStatus() {
    const pending = this.queue.filter(task => task.status === 'pending').length;
    const processing = this.queue.filter(task => task.status === 'processing').length;
    const failed = this.queue.filter(task => task.status === 'failed').length;
    
    return {
      total: this.queue.length,
      pending,
      processing,
      failed,
      isProcessing: this.processing,
      isOnline: this.isOnline()
    };
  }

  /**
   * 手动重试失败的任务
   */
  async retryFailedTasks() {
    const failedTasks = this.queue.filter(task => task.status === 'failed');
    
    failedTasks.forEach(task => {
      task.status = 'pending';
      task.retries = 0; // 重置重试次数
    });
    
    this.saveToStorage();
    
    if (this.isOnline() && !this.processing) {
      await this.processQueue();
    }
    
    console.log(`重置 ${failedTasks.length} 个失败任务`);
  }
}

// 创建全局删除队列实例
let deleteQueueInstance = null;

/**
 * 获取删除队列实例（单例模式）
 * @returns {DeleteQueue} 删除队列实例
 */
function getDeleteQueue() {
  if (!deleteQueueInstance) {
    deleteQueueInstance = new DeleteQueue();
  }
  return deleteQueueInstance;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DeleteQueue,
    getDeleteQueue
  };
} else if (typeof window !== 'undefined') {
  window.DeleteQueue = DeleteQueue;
  window.getDeleteQueue = getDeleteQueue;
}