import { TelegramStorage } from '../../src/telegram_storage';
import { redisClient } from '../../src/redis_client';
import crypto from 'crypto';

// 创建TelegramStorage实例
const telegramStorage = new TelegramStorage({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});

/**
 * 短链接生成API
 * 为文件生成短链接，支持自定义过期时间
 * 优化版本：将短链接信息存储在文件信息中，避免创建额外的键
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { fileId, expiresIn = 3600 } = req.body; // 默认1小时过期
    
    if (!fileId) {
      return res.status(400).json({ 
        success: false, 
        error: '没有提供文件ID' 
      });
    }

    // 获取文件信息
    let fileInfo;
    try {
      fileInfo = await telegramStorage.getFileInfo(fileId);
    } catch (error) {
      return res.status(404).json({ 
        success: false, 
        error: '文件不存在' 
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn * 1000);
    
    // 检查是否已有有效的短链接
    if (fileInfo.shortLink && fileInfo.shortLink.expiresAt) {
      const existingExpiresAt = new Date(fileInfo.shortLink.expiresAt);
      if (existingExpiresAt > now) {
        // 已有有效短链接，直接返回
        const baseUrl = req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000';
        const shortUrl = `${baseUrl}/api/download?s=${fileInfo.shortLink.shortId}`;
        
        console.log(`使用现有短链接: ${shortUrl} -> ${fileId}`);
        
        return res.status(200).json({ 
          success: true, 
          shortUrl: shortUrl,
          shortId: fileInfo.shortLink.shortId,
          expiresIn: Math.floor((existingExpiresAt - now) / 1000),
          expiresAt: fileInfo.shortLink.expiresAt,
          isExisting: true
        });
      }
    }

    // 生成新的短链接ID（8位随机字符串）
    const shortId = crypto.randomBytes(4).toString('hex');
    
    // 将短链接信息添加到文件信息中
    fileInfo.shortLink = {
      shortId: shortId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessCount: 0
    };
    
    // 更新文件信息到Redis
    const fileKey = `file:${fileId}`;
    await redisClient.set(fileKey, fileInfo, 86400 * 30); // 30天过期
    
    // 生成短链接URL
    const baseUrl = req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000';
    const shortUrl = `${baseUrl}/api/download?s=${shortId}`;
    
    console.log(`生成新短链接: ${shortUrl} -> ${fileId}, 过期时间: ${expiresIn}秒`);
    
    res.status(200).json({ 
      success: true, 
      shortUrl: shortUrl,
      shortId: shortId,
      expiresIn: expiresIn,
      expiresAt: fileInfo.shortLink.expiresAt,
      isExisting: false
    });
    
  } catch (error) {
    console.error('生成短链接失败:', error);
    res.status(500).json({ 
      success: false, 
      error: `生成短链接失败: ${error.message}` 
    });
  }
}