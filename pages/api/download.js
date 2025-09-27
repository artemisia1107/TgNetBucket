import { TelegramStorage } from '../../src/telegram_storage';
import { getMimeType, createContentDisposition } from '../../src/mime_types.js';
import { redisClient } from '../../src/redis_client';
import axios from 'axios';

// 创建TelegramStorage实例
const telegramStorage = new TelegramStorage({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});

/**
 * 文件下载API
 * 支持原文件名下载、正确的MIME类型和短链接
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { fileId, s } = req.query; // s参数用于短链接
  let actualFileId = fileId;
  let isShortLink = false;
  
  // 处理短链接
  if (s) {
    isShortLink = true;
    try {
      // 新的短链接处理逻辑：从所有文件中查找匹配的短链接
      let foundFileInfo = null;
      let foundFileId = null;
      
      // 首先尝试从旧的短链接键获取（向后兼容）
      const oldShortLinkKey = `short:${s}`;
      const oldShortLinkData = await redisClient.get(oldShortLinkKey);
      
      if (oldShortLinkData) {
        // 处理旧格式的短链接
        const expiresAt = new Date(oldShortLinkData.expiresAt);
        if (expiresAt < new Date()) {
          await redisClient.del(oldShortLinkKey); // 删除过期的短链接
          return res.status(410).json({ 
            success: false, 
            error: '短链接已过期' 
          });
        }
        
        actualFileId = oldShortLinkData.fileId;
        
        // 更新访问计数
        oldShortLinkData.accessCount = (oldShortLinkData.accessCount || 0) + 1;
        oldShortLinkData.lastAccessAt = new Date().toISOString();
        
        const remainingTtl = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));
        await redisClient.set(oldShortLinkKey, oldShortLinkData, remainingTtl);
        
        console.log(`旧短链接访问: ${s} -> ${actualFileId}, 访问次数: ${oldShortLinkData.accessCount}`);
      } else {
        // 新格式：从文件信息中查找短链接
        const files = await telegramStorage.listFiles();
        
        for (const file of files) {
          const fileInfo = await telegramStorage.getFileInfo(file.fileId);
          if (fileInfo.shortLink && fileInfo.shortLink.shortId === s) {
            // 检查是否过期
            const expiresAt = new Date(fileInfo.shortLink.expiresAt);
            if (expiresAt < new Date()) {
              // 清除过期的短链接
              delete fileInfo.shortLink;
              const fileKey = `file:${file.fileId}`;
              await redisClient.set(fileKey, fileInfo, 86400 * 30);
              
              return res.status(410).json({ 
                success: false, 
                error: '短链接已过期' 
              });
            }
            
            foundFileInfo = fileInfo;
            foundFileId = file.fileId;
            break;
          }
        }
        
        if (!foundFileInfo) {
          return res.status(404).json({ 
            success: false, 
            error: '短链接不存在或已过期' 
          });
        }
        
        actualFileId = foundFileId;
        
        // 更新访问计数
        foundFileInfo.shortLink.accessCount = (foundFileInfo.shortLink.accessCount || 0) + 1;
        foundFileInfo.shortLink.lastAccessAt = new Date().toISOString();
        
        // 更新文件信息
        const fileKey = `file:${foundFileId}`;
        await redisClient.set(fileKey, foundFileInfo, 86400 * 30);
        
        console.log(`新短链接访问: ${s} -> ${actualFileId}, 访问次数: ${foundFileInfo.shortLink.accessCount}`);
      }
      
    } catch (error) {
      console.error('处理短链接失败:', error);
      return res.status(500).json({ 
        success: false, 
        error: '短链接处理失败' 
      });
    }
  }
  
  if (!actualFileId) {
    return res.status(400).json({ 
      success: false, 
      error: '没有提供文件ID' 
    });
  }

  try {
    // 获取文件信息
    const fileInfo = await telegramStorage.getFileInfo(actualFileId);
    
    // 获取文件下载链接
    const fileUrl = await telegramStorage.downloadFile(actualFileId);
    
    // 获取文件内容
    const response = await axios.get(fileUrl, { 
      responseType: 'stream',
      timeout: 30000 // 30秒超时
    });
    
    // 获取原文件名和MIME类型
    const originalFileName = fileInfo.fileName || 'download';
    const mimeType = getMimeType(originalFileName);
    
    // 设置优化的响应头
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', createContentDisposition(originalFileName));
    
    // 设置文件大小（如果可用）
    if (fileInfo.fileSize) {
      res.setHeader('Content-Length', fileInfo.fileSize);
    }
    
    // 设置缓存控制
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时缓存
    res.setHeader('ETag', `"${actualFileId}"`);
    
    // 设置安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // 支持断点续传
    res.setHeader('Accept-Ranges', 'bytes');
    
    // 将文件流传输给客户端
    response.data.pipe(res);
    
    // 记录下载日志
    console.log(`文件下载: ${originalFileName} (${actualFileId}), 大小: ${fileInfo.fileSize || 'unknown'} bytes`);
    
  } catch (error) {
    console.error('下载文件失败:', error);
    
    // 根据错误类型返回不同的状态码
    if (error.message.includes('文件信息未找到') || error.message.includes('文件未找到')) {
      return res.status(404).json({ 
        success: false, 
        error: '文件不存在或已被删除' 
      });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({ 
        success: false, 
        error: '下载超时，请重试' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `下载失败: ${error.message}` 
    });
  }
}