import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from './redis_client.js';
import { promises as dns } from 'dns';
import https from 'https';

class TelegramStorage {
  constructor(options) {
    this.botToken = options.botToken;
    this.chatId = options.chatId;
    
    // 允许注入客户端用于测试
    this.telegramClient = options.telegramClient || new TelegramBot(this.botToken, { 
      polling: false,
      request: {
        agentOptions: {
          timeout: 60000, // 增加到60秒超时
          keepAlive: true,
          keepAliveMsecs: 30000
        }
      }
    });
    
    // 重试配置 - 针对删除操作增加更多重试
    this.retryConfig = {
      maxRetries: 5, // 增加到5次重试
      retryDelay: 3000, // 增加到3秒
      backoffMultiplier: 1.5 // 降低退避倍数，避免等待时间过长
    };
  }

  /**
   * 网络连接诊断功能
   * @returns {Promise<Object>} 诊断结果
   */
  async diagnoseNetworkConnection() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      telegramApiReachable: false,
      dnsResolution: false,
      internetConnection: false,
      details: [],
      icons: {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        search: 'fas fa-search',
        chart: 'fas fa-chart-line'
      }
    };

    try {
      // 1. 检查基本网络连接
      console.log('[诊断] 开始网络连接诊断...');
      
      // 2. 测试 DNS 解析
      try {
        await dns.lookup('api.telegram.org');
        diagnostics.dnsResolution = true;
        diagnostics.details.push({
          status: 'success',
          icon: 'fas fa-check-circle',
          message: 'DNS 解析正常'
        });
      } catch (error) {
        diagnostics.details.push({
          status: 'error',
          icon: 'fas fa-times-circle',
          message: `DNS 解析失败: ${error.message}`
        });
      }

      // 3. 测试基本网络连接
      try {
        await new Promise((resolve, reject) => {
          const req = https.request({
            hostname: 'www.google.com',
            port: 443,
            path: '/',
            method: 'HEAD',
            timeout: 10000
          }, (_res) => {
            diagnostics.internetConnection = true;
            resolve();
          });
          
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('连接超时')));
          req.end();
        });
        diagnostics.details.push({
          status: 'success',
          icon: 'fas fa-check-circle',
          message: '基本网络连接正常'
        });
      } catch (error) {
        diagnostics.details.push({
          status: 'error',
          icon: 'fas fa-times-circle',
          message: `基本网络连接失败: ${error.message}`
        });
      }

      // 4. 测试 Telegram API 连接
      try {
        await this.telegramClient.getMe();
        diagnostics.telegramApiReachable = true;
        diagnostics.details.push({
          status: 'success',
          icon: 'fas fa-check-circle',
          message: 'Telegram API 连接正常'
        });
      } catch (error) {
        diagnostics.details.push({
          status: 'error',
          icon: 'fas fa-times-circle',
          message: `Telegram API 连接失败: ${error.message}`
        });
        
        // 分析具体错误类型
        if (error.message.includes('ETIMEDOUT')) {
          diagnostics.details.push({
            status: 'warning',
            icon: 'fas fa-exclamation-triangle',
            message: '可能原因: 网络超时，建议检查防火墙或代理设置'
          });
        } else if (error.message.includes('ECONNREFUSED')) {
          diagnostics.details.push({
            status: 'warning',
            icon: 'fas fa-exclamation-triangle',
            message: '可能原因: 连接被拒绝，可能是网络限制'
          });
        } else if (error.message.includes('ENOTFOUND')) {
          diagnostics.details.push({
            status: 'warning',
            icon: 'fas fa-exclamation-triangle',
            message: '可能原因: DNS 解析失败或网络不可达'
          });
        }
      }

      console.log('[诊断] 网络诊断结果:', diagnostics);
      return diagnostics;
      
    } catch (error) {
      diagnostics.details.push({
        status: 'error',
        icon: 'fas fa-times-circle',
        message: `诊断过程出错: ${error.message}`
      });
      return diagnostics;
    }
  }

  /**
   * 重试机制辅助函数
   * @param {Function} operation - 要执行的操作
   * @param {string} operationName - 操作名称，用于日志
   * @returns {Promise} 操作结果
   */
  async retryOperation(operation, operationName = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`${operationName} 第 ${attempt} 次尝试失败:`, error.message);
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }
        
        // 计算延迟时间（指数退避）
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        console.log(`等待 ${delay}ms 后重试...`);
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * 上传文件到Telegram
   * @param {Buffer} fileBuffer - 文件内容的Buffer
   * @param {string} fileName - 文件名
   * @returns {Promise<{fileId: string, messageId: string}>} - 上传结果
   */
  async uploadFile(fileBuffer, fileName) {
    try {
      // 使用重试机制上传文件
      const response = await this.retryOperation(async () => {
        return await this.telegramClient.sendDocument(this.chatId, fileBuffer, {}, {
          filename: fileName,
          contentType: 'application/octet-stream'
        });
      }, `上传文件 ${fileName}`);
      
      const fileInfo = {
        fileId: response.document?.file_id || '',
        messageId: response.message_id.toString(),
        fileName,
        fileSize: response.document?.file_size || fileBuffer.length,
        uploadTime: new Date().toISOString(),
        chatId: this.chatId
      };
      
      // 将文件信息存储到Redis中
      const fileListKey = `files:${this.chatId}`;
      await redisClient.lpush(fileListKey, fileInfo);
      
      // 设置文件信息的单独键，方便快速查找
      const fileKey = `file:${fileInfo.fileId}`;
      await redisClient.set(fileKey, fileInfo, 86400 * 30); // 30天过期
      
      return {
        fileId: fileInfo.fileId,
        messageId: fileInfo.messageId
      };
    } catch (error) {
      console.error('上传文件到Telegram失败:', error);
      throw new Error(`上传文件失败: ${error.message}`);
    }
  }

  /**
   * 从Telegram下载文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<string>} - 文件下载链接
   */
  async downloadFile(fileId) {
    try {
      const file = await this.telegramClient.getFile(fileId);
      const fileLink = await this.telegramClient.getFileLink(file.file_id);
      return fileLink;
    } catch (error) {
      console.error('从Telegram下载文件失败:', error);
      throw new Error(`下载文件失败: ${error.message}`);
    }
  }

  /**
   * 获取文件信息
   * @param {string} fileId - 文件ID
   * @returns {Promise<Object>} - 文件信息对象
   */
  async getFileInfo(fileId) {
    try {
      // 首先尝试从Redis获取文件信息
      const fileKey = `file:${fileId}`;
      let fileInfo = await redisClient.get(fileKey);
      
      if (fileInfo) {
        // 如果是字符串，需要解析JSON
        if (typeof fileInfo === 'string') {
          try {
            fileInfo = JSON.parse(fileInfo);
          } catch (parseError) {
            console.warn('解析文件信息JSON失败:', parseError);
            // 如果解析失败，删除无效数据并继续从文件列表查找
            await redisClient.del(fileKey);
            fileInfo = null;
          }
        }
        
        if (fileInfo) {
          return fileInfo;
        }
      }
      
      // 如果Redis中没有，尝试从文件列表中查找
      const files = await this.listFiles();
      fileInfo = files.find(file => file.fileId === fileId);
      
      if (fileInfo) {
        // 将找到的文件信息存储到Redis
        await redisClient.set(fileKey, JSON.stringify(fileInfo), 86400 * 30); // 30天过期
        return fileInfo;
      }
      
      throw new Error('文件信息未找到');
    } catch (error) {
      console.error('获取文件信息失败:', error);
      throw new Error(`获取文件信息失败: ${error.message}`);
    }
  }

  /**
   * 列出文件列表
   * 优先从Redis获取，如果Redis为空则从Telegram同步
   * @returns {Promise<Array<{fileId: string, fileName: string, messageId: string}>>} - 文件列表
   */
  async listFiles() {
    try {
      const fileListKey = `files:${this.chatId}`;
      
      // 首先尝试从Redis获取文件列表
      let files = await redisClient.lrange(fileListKey);
      
      // 如果Redis中没有数据，从Telegram同步
      if (!files || files.length === 0) {
        console.log('Redis中无文件列表，从Telegram同步...');
        files = await this.syncFilesFromTelegram();
      } else {
        // 解析JSON字符串
        files = files.map(fileStr => {
          try {
            return typeof fileStr === 'string' ? JSON.parse(fileStr) : fileStr;
          } catch (parseError) {
            console.warn('解析文件信息JSON失败:', parseError);
            return null;
          }
        }).filter(file => file !== null);
      }
      
      // 按上传时间倒序排列（最新的在前面）
      files.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
      
      return files;
    } catch (error) {
      console.error('列出文件失败:', error);
      throw new Error(`列出文件失败: ${error.message}`);
    }
  }

  /**
   * 从Telegram同步文件列表到Redis
   * @returns {Promise<Array>} 同步的文件列表
   */
  async syncFilesFromTelegram() {
    try {
      // 使用重试机制获取最近的消息（包含文档的消息）
      const updates = await this.retryOperation(async () => {
        return await this.telegramClient.getUpdates({
          limit: 100, // 获取最近100条更新
          allowed_updates: ['message'] // 只获取消息更新
        });
      }, '从Telegram同步文件');
      
      const files = [];
      const fileListKey = `files:${this.chatId}`;
      
      // 遍历更新，查找包含文档的消息
      for (const update of updates) {
        if (update.message && 
            update.message.chat.id.toString() === this.chatId.toString() &&
            update.message.document) {
          
          const doc = update.message.document;
          const fileInfo = {
            fileId: doc.file_id,
            fileName: doc.file_name || `document_${doc.file_id.slice(-8)}`,
            messageId: update.message.message_id.toString(),
            fileSize: doc.file_size,
            uploadTime: new Date(update.message.date * 1000).toISOString(),
            chatId: this.chatId
          };
          
          files.push(fileInfo);
          
          // 将文件信息存储到Redis
          await redisClient.lpush(fileListKey, JSON.stringify(fileInfo));
          
          // 设置文件信息的单独键
          const fileKey = `file:${fileInfo.fileId}`;
          await redisClient.set(fileKey, JSON.stringify(fileInfo), 86400 * 30); // 30天过期
        }
      }
      
      console.log(`从Telegram同步了 ${files.length} 个文件到Redis`);
      return files;
    } catch (error) {
      console.error('从Telegram同步文件失败:', error);
      return [];
    }
  }

  /**
   * 从Telegram删除文件
   * @param {string} messageId - 消息ID
   * @returns {Promise<boolean>} - 删除结果
   */
  async deleteFile(messageId) {
    let fileToDelete = null;
    
    try {
      // 先获取文件信息，用于更好的错误提示
      const fileListKey = `files:${this.chatId}`;
      const files = await redisClient.lrange(fileListKey);
      fileToDelete = files.find(file => file.messageId === messageId);
      
      // 使用重试机制从Telegram删除消息
      await this.retryOperation(async () => {
        await this.telegramClient.deleteMessage(this.chatId, messageId);
      }, `删除Telegram消息 ${messageId}${fileToDelete ? ` (${fileToDelete.fileName})` : ''}`);
      
      // 从Redis中删除文件信息
      if (fileToDelete) {
        // 从文件列表中移除
        await redisClient.lrem(fileListKey, fileToDelete);
        
        // 删除文件的单独键
        const fileKey = `file:${fileToDelete.fileId}`;
        await redisClient.del(fileKey);
        
        console.log(`已从Redis删除文件: ${fileToDelete.fileName}`);
      }
      
      return true;
    } catch (error) {
      console.error('从Telegram删除文件失败:', error);
      
      // 在网络错误时自动进行诊断
      let diagnostics = null;
      if (error.message.includes('ETIMEDOUT') || 
          error.message.includes('ECONNREFUSED') || 
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNRESET') ||
          error.code === 'EFATAL') {
        
        console.log('[错误处理] 检测到网络错误，开始自动诊断...');
        try {
          diagnostics = await this.diagnoseNetworkConnection();
        } catch (diagError) {
          console.error('[错误处理] 网络诊断失败:', diagError);
        }
      }
      
      // 根据错误类型提供更具体的错误信息
      let errorMessage = '';
      let errorType = 'UNKNOWN_ERROR';
      
      if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        const fileName = fileToDelete ? fileToDelete.fileName : '文件';
        errorMessage = `删除 ${fileName} 时网络连接超时，已尝试多次重试。请检查网络连接后重试，或稍后再试。`;
        errorType = 'NETWORK_TIMEOUT';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '无法连接到Telegram服务器，服务器可能暂时不可用。请稍后重试。';
        errorType = 'SERVICE_UNAVAILABLE';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = '网络连接失败，无法解析服务器地址。请检查网络设置和DNS配置。';
        errorType = 'NETWORK_ERROR';
      } else if (error.message.includes('ECONNRESET')) {
        errorMessage = '网络连接被重置，可能是网络不稳定。请稍后重试。';
        errorType = 'CONNECTION_RESET';
      } else if (error.code === 'EFATAL') {
        errorMessage = 'Telegram API连接失败，请检查网络连接或稍后重试。';
        errorType = 'API_CONNECTION_ERROR';
      } else {
        const fileName = fileToDelete ? fileToDelete.fileName : '文件';
        errorMessage = `删除 ${fileName} 失败: ${error.message}`;
        errorType = 'UNKNOWN_ERROR';
      }
      
      // 创建增强的错误对象
      const enhancedError = new Error(errorMessage);
      enhancedError.type = errorType;
      enhancedError.originalError = error;
      enhancedError.diagnostics = diagnostics;
      enhancedError.timestamp = new Date().toISOString();
      
      throw enhancedError;
    }
  }
}

export { TelegramStorage };