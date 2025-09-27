import { redisClient } from '../../../src/redis_client';
import fs from 'fs';
import path from 'path';

/**
 * 管理面板 - 数据库备份API
 * 导出数据库内容为JSON文件
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      environment: redisClient.isConnected() ? 'production' : 'development',
      data: {}
    };

    if (redisClient.isConnected()) {
      // Redis环境 - 导出所有键值对
      const redis = redisClient.getClient();
      
      // 获取所有键
      const keys = await redis.keys('*');
      console.log(`找到 ${keys.length} 个Redis键`);

      for (const key of keys) {
        try {
          // 获取键的类型
          const type = await redis.type(key);
          
          switch (type) {
            case 'string':
              backupData.data[key] = await redis.get(key);
              break;
            case 'hash':
              backupData.data[key] = await redis.hgetall(key);
              break;
            case 'list':
              backupData.data[key] = await redis.lrange(key, 0, -1);
              break;
            case 'set':
              backupData.data[key] = await redis.smembers(key);
              break;
            case 'zset':
              backupData.data[key] = await redis.zrange(key, 0, -1, 'WITHSCORES');
              break;
            default:
              console.warn(`未知的Redis数据类型: ${type} for key: ${key}`);
          }
        } catch (error) {
          console.error(`备份键 ${key} 失败:`, error);
          backupData.data[key] = { error: error.message };
        }
      }
    } else {
      // 内存环境 - 导出内存存储
      const memoryStorage = redisClient.getMemoryStorage();
      backupData.data = { ...memoryStorage };
    }

    // 生成备份文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    
    // 确保备份目录存在
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 写入备份文件
    const backupPath = path.join(backupDir, filename);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    const stats = {
      keysCount: Object.keys(backupData.data).length,
      fileSize: fs.statSync(backupPath).size,
      filePath: backupPath,
      filename
    };

    console.log('数据库备份完成:', stats);

    res.status(200).json({
      success: true,
      message: '数据库备份完成',
      data: {
        filename,
        keysCount: stats.keysCount,
        fileSize: stats.fileSize,
        timestamp: backupData.timestamp,
        environment: backupData.environment
      }
    });

  } catch (error) {
    console.error('数据库备份失败:', error);
    res.status(500).json({
      success: false,
      error: `备份失败: ${error.message}`
    });
  }
}