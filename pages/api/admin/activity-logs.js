import { redisClient } from '../../../src/redis_client';

/**
 * 管理面板 - 用户活动日志API
 * 记录和查询用户活动日志
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // 获取活动日志
    return await getActivityLogs(req, res);
  } else if (method === 'POST') {
    // 记录活动日志
    return await logActivity(req, res);
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}

/**
 * 获取活动日志
 */
async function getActivityLogs(req, res) {
  try {
    const { limit = 100, offset = 0, action, ip } = req.query;
    
    const logs = [];
    const logKey = 'activity_logs';

    if (redisClient.isConnected()) {
      // Redis环境
      const redis = redisClient.getClient();
      
      // 获取日志列表（按时间倒序）
      const logEntries = await redis.lrange(logKey, offset, offset + limit - 1);
      
      for (const entry of logEntries) {
        try {
          const log = JSON.parse(entry);
          
          // 过滤条件
          if (action && log.action !== action) {
            continue;
          }
          if (ip && log.ip !== ip) {
            continue;
          }
          
          logs.push(log);
        } catch (error) {
          console.error('解析日志条目失败:', error);
        }
      }
    } else {
      // 内存环境
      const { memoryStore } = redisClient;
      const logData = memoryStore.get(logKey);
      const allLogs = logData ? logData.value || [] : [];
      
      // 确保allLogs是数组
      if (Array.isArray(allLogs)) {
        // 过滤和分页
        const filteredLogs = allLogs.filter(log => {
          if (action && log.action !== action) {
            return false;
          }
          if (ip && log.ip !== ip) {
            return false;
          }
          return true;
        });
        
        logs.push(...filteredLogs.slice(offset, offset + limit));
      }
    }

    // 统计信息
    const stats = await getActivityStats();

    res.status(200).json({
      success: true,
      data: {
        logs,
        stats,
        pagination: {
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10),
          total: logs.length
        }
      }
    });

  } catch (error) {
    console.error('获取活动日志失败:', error);
    res.status(500).json({
      success: false,
      error: `获取日志失败: ${error.message}`
    });
  }
}

/**
 * 记录活动日志
 */
async function logActivity(req, res) {
  try {
    const { action, details, fileId, ip } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: action'
      });
    }

    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      details: details || '',
      fileId: fileId || null,
      ip: ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    const logKey = 'activity_logs';
    const maxLogs = 10000; // 最多保留10000条日志

    if (redisClient.isConnected()) {
      // Redis环境
      const redis = redisClient.getClient();
      
      // 添加到列表头部
      await redis.lpush(logKey, JSON.stringify(logEntry));
      
      // 保持列表长度
      await redis.ltrim(logKey, 0, maxLogs - 1);
      
      // 更新统计
      await updateActivityStats(action);
      
    } else {
      // 内存环境
      const { memoryStore } = redisClient;
      const logData = memoryStore.get(logKey);
      let logs = logData ? logData.value || [] : [];
      
      // 添加到数组头部
      logs.unshift(logEntry);
      
      // 保持数组长度
      if (logs.length > maxLogs) {
        logs = logs.slice(0, maxLogs);
      }
      
      // 保存回内存存储
      memoryStore.set(logKey, { value: logs, timestamp: Date.now() });
      
      // 更新统计
      await updateActivityStats(action);
    }

    console.log('活动日志记录:', logEntry);

    res.status(200).json({
      success: true,
      message: '活动日志已记录',
      data: logEntry
    });

  } catch (error) {
    console.error('记录活动日志失败:', error);
    res.status(500).json({
      success: false,
      error: `记录日志失败: ${error.message}`
    });
  }
}

/**
 * 获取活动统计
 */
async function getActivityStats() {
  try {
    const statsKey = 'activity_stats';
    
    if (redisClient.isConnected()) {
      const redis = redisClient.getClient();
      const stats = await redis.hgetall(statsKey);
      
      // 检查stats是否为有效对象
      if (!stats || typeof stats !== 'object') {
        return {};
      }
      
      // 转换数值
      const result = {};
      for (const [key, value] of Object.entries(stats)) {
        result[key] = parseInt(value, 10) || 0;
      }
      return result;
    }
    
    const { memoryStore } = redisClient;
    const statsData = memoryStore.get(statsKey);
    const stats = statsData ? statsData.value : null;
    
    // 检查stats是否为有效对象
    if (!stats || typeof stats !== 'object') {
      return {};
    }
    
    return stats;
  } catch (error) {
    console.error('获取活动统计失败:', error);
    return {};
  }
}

/**
 * 更新活动统计
 */
async function updateActivityStats(action) {
  try {
    const statsKey = 'activity_stats';
    
    if (redisClient.isConnected()) {
      const redis = redisClient.getClient();
      await redis.hincrby(statsKey, action, 1);
      await redis.hincrby(statsKey, 'total', 1);
    } else {
      const { memoryStore } = redisClient;
      const statsData = memoryStore.get(statsKey);
      const stats = statsData ? statsData.value || {} : {};
      
      stats[action] = (stats[action] || 0) + 1;
      stats.total = (stats.total || 0) + 1;
      
      // 保存回内存存储
      memoryStore.set(statsKey, { value: stats, timestamp: Date.now() });
    }
  } catch (error) {
    console.error('更新活动统计失败:', error);
  }
}