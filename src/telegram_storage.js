const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

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
   * @returns {Promise<Array<{fileId: string, fileName: string, messageId: string}>>} - 文件列表
   */
  async listFiles() {
    try {
      // 获取聊天历史记录
      const chat = await this.telegramClient.getChat(this.chatId);
      const messages = await this.telegramClient.getChatHistory(chat.id);
      
      // 过滤出包含文档的消息
      return messages
        .filter(msg => msg.document)
        .map(msg => ({
          fileId: msg.document.file_id,
          fileName: msg.document.file_name,
          messageId: msg.message_id.toString()
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
      return true;
    } catch (error) {
      console.error('从Telegram删除文件失败:', error);
      throw new Error(`删除文件失败: ${error.message}`);
    }
  }
}

module.exports = { TelegramStorage };