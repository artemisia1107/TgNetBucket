import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

class TelegramStorage {
  constructor(options) {
    this.botToken = options.botToken;
    this.chatId = options.chatId;
    
    // 允许注入客户端用于测试
    this.telegramClient = options.telegramClient || new TelegramBot(this.botToken, { polling: false });
    
    // 简单的内存文件列表存储（在生产环境中应使用数据库）
    this.fileList = [];
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
      
      const fileInfo = {
        fileId: response.document?.file_id || '',
        messageId: response.message_id.toString(),
        fileName: fileName,
        uploadTime: new Date().toISOString()
      };
      
      // 将文件信息添加到内存列表中
      this.fileList.push(fileInfo);
      
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
   * 列出Telegram中的文件
   * 注意：由于Telegram Bot API的限制，无法直接获取历史消息
   * 这个方法返回内存中维护的文件列表
   * @returns {Promise<Array<{fileId: string, fileName: string, messageId: string}>>} - 文件列表
   */
  async listFiles() {
    try {
      // 返回内存中存储的文件列表
      return this.fileList.map(file => ({
        fileId: file.fileId,
        fileName: file.fileName,
        messageId: file.messageId
      }));
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
      
      // 从内存列表中移除对应的文件信息
      this.fileList = this.fileList.filter(file => file.messageId !== messageId);
      
      return true;
    } catch (error) {
      console.error('从Telegram删除文件失败:', error);
      throw new Error(`删除文件失败: ${error.message}`);
    }
  }
}

export { TelegramStorage };