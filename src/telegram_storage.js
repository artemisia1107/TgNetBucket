import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from './redis_client.js';

class TelegramStorage {
  constructor(options) {
    this.botToken = options.botToken;
    this.chatId = options.chatId;
    
    // 允许注入客户端用于测试
    this.telegramClient = options.telegramClient || new TelegramBot(this.botToken, { 
      polling: false,
      request: {
        agentOptions: {
          timeout: 30000, // 30秒超时
          keepAlive: true,
          keepAliveMsecs: 30000
        }
      }
    });
    
    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 2000, // 2秒
      backoffMultiplier: 2
    };
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
    try {
      // 从Telegram删除消息
      await this.telegramClient.deleteMessage(this.chatId, messageId);
      
      // 从Redis中删除文件信息
      const fileListKey = `files:${this.chatId}`;
      const files = await redisClient.lrange(fileListKey);
      
      // 找到要删除的文件
      const fileToDelete = files.find(file => file.messageId === messageId);
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
      throw new Error(`删除文件失败: ${error.message}`);
    }
  }
}

export { TelegramStorage };