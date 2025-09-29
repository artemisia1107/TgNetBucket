import { redisClient } from '../../src/redis_client';

/**
 * 清理旧的短链接数据API
 * 删除所有 short:* 格式的旧短链接键，释放数据库空间
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    let deletedCount = 0;
    let scannedCount = 0;
    
    // 如果使用的是内存存储（开发环境）
    if (!redisClient.isConnected()) {
      // 清理内存存储中的短链接
      const { memoryStore } = redisClient;
      if (memoryStore) {
        for (const [key] of memoryStore) {
          scannedCount++;
          if (key.startsWith('short:')) {
            memoryStore.delete(key);
            deletedCount++;
          }
        }
      }
      
      console.log(`内存存储清理完成: 扫描 ${scannedCount} 个键，删除 ${deletedCount} 个短链接`);
      
      return res.status(200).json({
        success: true,
        message: '清理完成（内存存储）',
        scannedCount,
        deletedCount,
        environment: 'development'
      });
    }

    // 如果使用的是 Redis
    const redis = redisClient.getClient();
    if (!redis) {
      return res.status(500).json({
        success: false,
        error: 'Redis 客户端未初始化'
      });
    }

    // 使用 SCAN 命令查找所有 short:* 键
    let cursor = 0;
    const keysToDelete = [];
    
    do {
      try {
        // 注意：Upstash Redis 的 scan 方法可能有不同的参数格式
        const result = await redis.scan(cursor, { match: 'short:*', count: 100 });
        
        if (Array.isArray(result) && result.length >= 2) {
          const [cursorStr, keys] = result;
          cursor = parseInt(cursorStr, 10);
          
          if (Array.isArray(keys)) {
            keysToDelete.push(...keys);
            scannedCount += keys.length;
          }
        } else {
          // 如果返回格式不同，尝试其他方式
          break;
        }
      } catch (scanError) {
        console.error('SCAN 命令执行失败:', scanError);
        // 如果 SCAN 不支持，尝试使用 KEYS（注意：KEYS 在生产环境中性能较差）
        try {
          const keys = await redis.keys('short:*');
          if (Array.isArray(keys)) {
            keysToDelete.push(...keys);
            scannedCount += keys.length;
          }
        } catch (keysError) {
          console.error('KEYS 命令也失败:', keysError);
          return res.status(500).json({
            success: false,
            error: '无法扫描短链接键'
          });
        }
        break;
      }
    } while (cursor !== 0);

    // 批量删除找到的键
    if (keysToDelete.length > 0) {
      try {
        // 分批删除，避免一次删除太多
        const batchSize = 50;
        for (let i = 0; i < keysToDelete.length; i += batchSize) {
          const batch = keysToDelete.slice(i, i + batchSize);
          await redis.del(...batch);
          deletedCount += batch.length;
        }
      } catch (deleteError) {
        console.error('批量删除失败:', deleteError);
        // 尝试逐个删除
        for (const key of keysToDelete) {
          try {
            await redis.del(key);
            deletedCount++;
          } catch (singleDeleteError) {
            console.error(`删除键 ${key} 失败:`, singleDeleteError);
          }
        }
      }
    }

    console.log(`Redis 清理完成: 扫描 ${scannedCount} 个短链接键，删除 ${deletedCount} 个`);

    res.status(200).json({
      success: true,
      message: '清理完成',
      scannedCount,
      deletedCount,
      environment: 'production'
    });

  } catch (error) {
    console.error('清理短链接数据失败:', error);
    res.status(500).json({
      success: false,
      error: `清理失败: ${error.message}`
    });
  }
}