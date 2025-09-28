import { redisClient } from '../../../src/redis_client';
import path from 'path';

/**
 * 管理面板 - 系统统计API
 * 提供文件数量、大小、类型等统计信息
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      fileTypes: {},
      shortLinks: 0,
      lastUpdated: new Date().toISOString()
    };

    // 获取文件列表数据
    let filesData = null;
    
    if (redisClient.isConnected()) {
      // 从 Redis 获取数据
      const redis = redisClient.getClient();
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (redis && chatId) {
        try {
          // 先检查键的类型
          const keyType = await redis.type(`files:${chatId}`);
          
          if (keyType === 'string') {
            const filesJson = await redis.get(`files:${chatId}`);
            if (filesJson) {
              const parsedData = typeof filesJson === 'string' ? JSON.parse(filesJson) : filesJson;
              filesData = Array.isArray(parsedData) ? parsedData : parsedData.files || [];
            }
          } else if (keyType === 'hash') {
            // 如果是hash类型，尝试获取files字段
            const hashData = await redis.hgetall(`files:${chatId}`);
            if (hashData && hashData.files) {
              const parsedData = typeof hashData.files === 'string' ? JSON.parse(hashData.files) : hashData.files;
              filesData = Array.isArray(parsedData) ? parsedData : [];
            }
          } else if (keyType === 'list') {
            // 如果是list类型，获取所有元素
            const listData = await redis.lrange(`files:${chatId}`, 0, -1);
            if (listData && listData.length > 0) {
              filesData = listData.map(item => {
                try {
                  return typeof item === 'string' ? JSON.parse(item) : item;
                } catch {
                  return null;
                }
              }).filter(item => item !== null);
            }
          } else if (keyType !== 'none') {
            console.log(`文件数据键类型为 ${keyType}，跳过处理`);
          }
        } catch (error) {
          console.error('从Redis获取文件数据失败:', error);
        }
      }
    } else {
      // 从内存存储获取数据
      const memoryStore = redisClient.memoryStore;
      if (memoryStore) {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const filesJson = memoryStore.get(`files:${chatId}`);
        if (filesJson) {
          try {
            const parsedData = typeof filesJson === 'string' ? JSON.parse(filesJson) : filesJson;
            filesData = Array.isArray(parsedData) ? parsedData : parsedData.files || [];
          } catch (error) {
            console.error('解析内存存储文件数据失败:', error);
          }
        }
      }
    }

    // 统计文件信息
    if (filesData && Array.isArray(filesData)) {
      stats.totalFiles = filesData.length;
      
      filesData.forEach(file => {
        // 统计文件大小
        if (file.fileSize && typeof file.fileSize === 'number') {
          stats.totalSize += file.fileSize;
        }

        // 统计文件类型
        let fileType = '其他';
        if (file.fileName) {
          const ext = path.extname(file.fileName).toLowerCase();
          
          // 根据扩展名分类
          if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(ext)) {
            fileType = '图片';
          } else if (['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'].includes(ext)) {
            fileType = '视频';
          } else if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'].includes(ext)) {
            fileType = '音频';
          } else if (['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'].includes(ext)) {
            fileType = '文档';
          } else if (['.xls', '.xlsx', '.csv', '.ods'].includes(ext)) {
            fileType = '表格';
          } else if (['.ppt', '.pptx', '.odp'].includes(ext)) {
            fileType = '演示';
          } else if (['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(ext)) {
            fileType = '压缩包';
          } else if (['.js', '.html', '.css', '.json', '.xml', '.py', '.java', '.cpp', '.c'].includes(ext)) {
            fileType = '代码';
          } else if (ext) {
            fileType = ext.substring(1).toUpperCase();
          }
        }

        stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;

        // 统计短链接
        if (file.short && file.short.shortId) {
          stats.shortLinks++;
        }
      });
    }

    // 如果使用Redis，还要统计旧格式的短链接
    if (redisClient.isConnected()) {
      try {
        const redis = redisClient.getClient();
        if (redis) {
          // 尝试扫描旧的短链接格式
          try {
            const result = await redis.scan(0, { match: 'short:*', count: 1000 });
            if (Array.isArray(result) && result.length >= 2) {
              const oldShortLinks = result[1];
              if (Array.isArray(oldShortLinks)) {
                stats.shortLinks += oldShortLinks.length;
              }
            }
          } catch {
            // 如果SCAN不支持，尝试KEYS
            try {
              const keys = await redis.keys('short:*');
              if (Array.isArray(keys)) {
                stats.shortLinks += keys.length;
              }
            } catch {
              console.log('无法扫描旧短链接，跳过统计');
            }
          }
        }
      } catch (error) {
        console.error('统计短链接失败:', error);
      }
    } else {
      // 统计内存存储中的旧短链接
      const memoryStore = redisClient.memoryStore;
      if (memoryStore) {
        for (const [key] of memoryStore) {
          if (key.startsWith('short:')) {
            stats.shortLinks++;
          }
        }
      }
    }

    // 如果是开发环境且没有真实数据，提供示例数据
    if (process.env.NODE_ENV === 'development' && stats.totalFiles === 0) {
      Object.assign(stats, {
        totalFiles: 15,
        totalSize: 52428800, // 50MB
        fileTypes: {
          '图片': 8,
          '视频': 3,
          '文档': 2,
          '音频': 1,
          '其他': 1
        },
        shortLinks: 12,
        lastUpdated: new Date().toISOString()
      });
    }

    console.log('系统统计:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取系统统计失败:', error);
    res.status(500).json({
      success: false,
      error: `获取统计失败: ${error.message}`
    });
  }
}