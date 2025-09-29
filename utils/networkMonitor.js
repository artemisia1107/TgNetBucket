/**
 * 网络监控工具
 * 提供网络状态监控、连接检测和自动重连机制
 */

class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.connectionQuality = 'unknown';
    this.lastCheckTime = null;
    this.checkInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 初始重连延迟 1 秒
    this.maxReconnectDelay = 30000; // 最大重连延迟 30 秒
    
    this.init();
  }

  /**
   * 初始化网络监控
   */
  init() {
    // 监听浏览器网络状态变化
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // 定期检查网络连接质量
    this.startPeriodicCheck();
    
    // 初始检查
    this.checkConnectionQuality();
  }

  /**
   * 添加网络状态监听器
   * @param {Function} listener - 监听器函数，接收 { isOnline, quality, timestamp } 参数
   */
  addListener(listener) {
    this.listeners.add(listener);
    
    // 立即通知当前状态
    listener({
      isOnline: this.isOnline,
      quality: this.connectionQuality,
      timestamp: this.lastCheckTime || Date.now()
    });
  }

  /**
   * 移除网络状态监听器
   * @param {Function} listener - 要移除的监听器函数
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   * @param {Object} status - 网络状态对象
   */
  notifyListeners(status) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('网络状态监听器错误:', error);
      }
    });
  }

  /**
   * 处理网络连接事件
   */
  handleOnline() {
    console.log('网络已连接');
    this.isOnline = true;
    this.reconnectAttempts = 0; // 重置重连计数
    this.checkConnectionQuality();
  }

  /**
   * 处理网络断开事件
   */
  handleOffline() {
    console.log('网络已断开');
    this.isOnline = false;
    this.connectionQuality = 'offline';
    this.lastCheckTime = Date.now();
    
    this.notifyListeners({
      isOnline: false,
      quality: 'offline',
      timestamp: this.lastCheckTime
    });

    // 开始自动重连
    this.startReconnectAttempts();
  }

  /**
   * 开始定期检查网络连接质量
   */
  startPeriodicCheck() {
    // 每 30 秒检查一次网络质量
    this.checkInterval = setInterval(() => {
      if (this.isOnline) {
        this.checkConnectionQuality();
      }
    }, 30000);
  }

  /**
   * 停止定期检查
   */
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 检查网络连接质量
   */
  async checkConnectionQuality() {
    if (!this.isOnline) {
      return;
    }

    const startTime = Date.now();
    
    try {
      // 测试多个端点以获得更准确的连接质量评估
      const tests = [
        this.testEndpoint('https://www.google.com/favicon.ico', 3000),
        this.testEndpoint('https://api.telegram.org', 5000),
        this.testEndpoint('/api/health', 2000) // 本地健康检查端点
      ];

      const results = await Promise.allSettled(tests);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const avgResponseTime = this.calculateAverageResponseTime(results, startTime);

      // 根据成功率和响应时间评估连接质量
      let quality;
      if (successCount === 0) {
        quality = 'poor';
      } else if (successCount === 1 || avgResponseTime > 5000) {
        quality = 'fair';
      } else if (avgResponseTime > 2000) {
        quality = 'good';
      } else {
        quality = 'excellent';
      }

      this.connectionQuality = quality;
      this.lastCheckTime = Date.now();

      this.notifyListeners({
        isOnline: true,
        quality: quality,
        timestamp: this.lastCheckTime,
        responseTime: avgResponseTime,
        successRate: successCount / tests.length
      });

    } catch (error) {
      console.error('网络质量检查失败:', error);
      this.connectionQuality = 'poor';
      this.lastCheckTime = Date.now();

      this.notifyListeners({
        isOnline: this.isOnline,
        quality: 'poor',
        timestamp: this.lastCheckTime,
        error: error.message
      });
    }
  }

  /**
   * 测试单个端点
   * @param {string} url - 测试的URL
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise} 测试结果
   */
  testEndpoint(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const controller = new AbortController();
      
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`请求超时: ${url}`));
      }, timeout);

      fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      })
      .then(() => {
        clearTimeout(timeoutId);
        resolve({
          url,
          responseTime: Date.now() - startTime,
          success: true
        });
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name !== 'AbortError') {
          reject(error);
        }
      });
    });
  }

  /**
   * 计算平均响应时间
   * @param {Array} results - 测试结果数组
   * @param {number} startTime - 开始时间
   * @returns {number} 平均响应时间
   */
  calculateAverageResponseTime(results, startTime) {
    const successfulResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    if (successfulResults.length === 0) {
      return Date.now() - startTime; // 如果没有成功的请求，返回总耗时
    }

    const totalTime = successfulResults.reduce((sum, result) => sum + result.responseTime, 0);
    return totalTime / successfulResults.length;
  }

  /**
   * 开始自动重连尝试
   */
  startReconnectAttempts() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('已达到最大重连次数，停止重连');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts + 1} 次重连`);

    setTimeout(async () => {
      this.reconnectAttempts++;
      
      try {
        // 尝试重新检查网络连接
        await this.checkConnectionQuality();
        
        if (this.connectionQuality !== 'offline' && this.connectionQuality !== 'poor') {
          console.log('网络重连成功');
          this.reconnectAttempts = 0;
          return;
        }
      } catch (error) {
        console.error('重连检查失败:', error);
      }

      // 如果还是离线或连接质量差，继续重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.startReconnectAttempts();
      }
    }, delay);
  }

  /**
   * 手动触发网络检查
   * @returns {Promise} 检查结果
   */
  async forceCheck() {
    await this.checkConnectionQuality();
    return {
      isOnline: this.isOnline,
      quality: this.connectionQuality,
      timestamp: this.lastCheckTime
    };
  }

  /**
   * 获取当前网络状态
   * @returns {Object} 当前网络状态
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      quality: this.connectionQuality,
      timestamp: this.lastCheckTime,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * 销毁网络监控器
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.stopPeriodicCheck();
    this.listeners.clear();
  }
}

// 创建全局网络监控器实例
let networkMonitorInstance = null;

/**
 * 获取网络监控器实例（单例模式）
 * @returns {NetworkMonitor} 网络监控器实例
 */
export function getNetworkMonitor() {
  if (!networkMonitorInstance) {
    networkMonitorInstance = new NetworkMonitor();
  }
  return networkMonitorInstance;
}

/**
 * 获取网络状态图标类名
 * @param {string} quality - 网络质量
 * @param {boolean} isOnline - 是否在线
 * @returns {string} Font Awesome 图标类名
 */
export function getNetworkStatusIcon(quality, isOnline) {
  if (!isOnline) {
    return 'fas fa-wifi-slash text-danger';
  }

  switch (quality) {
    case 'excellent':
      return 'fas fa-wifi text-success';
    case 'good':
      return 'fas fa-wifi text-success';
    case 'fair':
      return 'fas fa-wifi text-warning';
    case 'poor':
      return 'fas fa-wifi text-danger';
    default:
      return 'fas fa-wifi text-muted';
  }
}

/**
 * 获取网络状态描述
 * @param {string} quality - 网络质量
 * @param {boolean} isOnline - 是否在线
 * @returns {string} 状态描述
 */
export function getNetworkStatusText(quality, isOnline) {
  if (!isOnline) {
    return '网络已断开';
  }

  switch (quality) {
    case 'excellent':
      return '网络连接优秀';
    case 'good':
      return '网络连接良好';
    case 'fair':
      return '网络连接一般';
    case 'poor':
      return '网络连接较差';
    default:
      return '网络状态未知';
  }
}

export default NetworkMonitor;