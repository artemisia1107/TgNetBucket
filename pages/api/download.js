import { TelegramStorage } from '../../src/telegram_storage';
import axios from 'axios';

// 创建TelegramStorage实例
const telegramStorage = new TelegramStorage({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { fileId } = req.query;
  if (!fileId) {
    return res.status(400).json({ success: false, error: '没有提供文件ID' });
  }

  try {
    // 获取文件下载链接
    const fileUrl = await telegramStorage.downloadFile(fileId);
    
    // 获取文件内容
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    
    // 设置响应头
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', response.headers['content-disposition'] || 'attachment');
    
    // 将文件流传输给客户端
    response.data.pipe(res);
  } catch (error) {
    console.error('下载文件失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}