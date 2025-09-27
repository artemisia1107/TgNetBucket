import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

class TelegramStorage {
  constructor(options) {
    this.botToken = options.botToken;
    this.chatId = options.chatId;
    
    // 允许注入客户端用于测试
    this.telegramClient = options.telegramClient || new TelegramBot(this.botToken, { polling: false });
  }

  /**
   * 上传文件到Telegram
   * @param {Buffer} fileBuffer - 文件内容的Buffer
   * @param {string} fileName - 文件名
   * @returns {Promise<{fileId: string, messageId: string}>} - 上传结果
   */
  async uploadFile(fileBuffer, fileName) {
    try {
      const response = await this.telegramClient.sendDocument(this.chatId, fileBuffer, {
        filename: fileName
      });
      
      return {
        fileId: response.document?.file_id || '',
        messageId: response.message_id.toString()
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
   * 列出Telegram中的文件
   * 通过获取聊天记录中的文档消息来获取文件列表
   * @returns {Promise<Array<{fileId: string, fileName: string, messageId: string}>>} - 文件列表
   */
  async listFiles() {
    try {
      // 使用getUpdates获取最近的消息（包含文档的消息）
      const updates = await this.telegramClient.getUpdates({
        limit: 100, // 获取最近100条更新
        allowed_updates: ['message'] // 只获取消息更新
      });
      
      const files = [];
      
      // 遍历更新，查找包含文档的消息
      for (const update of updates) {
        if (update.message && 
            update.message.chat.id.toString() === this.chatId.toString() &&
            update.message.document) {
          
          const doc = update.message.document;
          files.push({
            fileId: doc.file_id,
            fileName: doc.file_name || `document_${doc.file_id.slice(-8)}`,
            messageId: update.message.message_id.toString(),
            fileSize: doc.file_size,
            uploadTime: new Date(update.message.date * 1000).toISOString()
          });
        }
      }
      
      // 按上传时间倒序排列（最新的在前面）
      files.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
      
      return files;
    } catch (error) {
      console.error('列出Telegram文件失败:', error);
      throw new Error(`列出文件失败: ${error.message}`);
    }
  }

  /**
   * 从Telegram删除文件
   * @param {string} messageId - 消息ID
   * @returns {Promise<boolean>} - 删除结果
   */
  async deleteFile(messageId) {
    try {
      await this.telegramClient.deleteMessage(this.chatId, messageId);
      return true;
    } catch (error) {
      console.error('从Telegram删除文件失败:', error);
      throw new Error(`删除文件失败: ${error.message}`);
    }
  }
}

export { TelegramStorage };