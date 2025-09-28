import { redisClient } from '../../../src/redis_client';
import axios from 'axios';

/**
 * 管理面板 - 系统状态监控API
 * 检查Redis连接、Telegram Bot状态等系统组件
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const status = {
      redis: {
        connected: false,
        environment: 'unknown',
        error: null
      },
      telegram: {
        configured: false,
        botToken: null,
        chatId: null,
        botInfo: null,
        error: null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        platform: process.platform,
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    };

    // 检查Redis状态
    try {
      status.redis.connected = redisClient.isConnected();
      
      if (status.redis.connected) {
        status.redis.environment = 'production';
        
        // 尝试执行一个简单的Redis操作来验证连接
        const redis = redisClient.getClient();
        if (redis) {
          try {
            await redis.ping();
            status.redis.healthy = true;
          } catch (pingError) {
            status.redis.healthy = false;
            status.redis.error = `Redis ping失败: ${pingError.message}`;
          }
        }
      } else {
        status.redis.environment = 'development';
        status.redis.healthy = true; // 内存存储总是健康的
      }
    } catch (error) {
      status.redis.error = error.message;
      status.redis.healthy = false;
    }

    // 检查Telegram配置
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    status.telegram.configured = !!(botToken && chatId);
    status.telegram.botToken = botToken ? `${botToken.substring(0, 10)}...` : null;
    status.telegram.chatId = chatId || null;

    // 如果配置了Telegram，尝试获取Bot信息
    if (botToken) {
      try {
        const botResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`, {
          timeout: 5000
        });
        
        if (botResponse.data.ok) {
          status.telegram.botInfo = {
            id: botResponse.data.result.id,
            username: botResponse.data.result.username,
            firstName: botResponse.data.result.first_name,
            canJoinGroups: botResponse.data.result.can_join_groups,
            canReadAllGroupMessages: botResponse.data.result.can_read_all_group_messages,
            supportsInlineQueries: botResponse.data.result.supports_inline_queries
          };
          status.telegram.healthy = true;
        } else {
          status.telegram.healthy = false;
          status.telegram.error = 'Bot API返回错误';
        }
      } catch (error) {
        status.telegram.healthy = false;
        status.telegram.error = `无法连接到Telegram API: ${error.message}`;
      }
    } else {
      status.telegram.healthy = false;
      status.telegram.error = 'Bot Token未配置';
    }

    // 如果配置了Chat ID，尝试验证
    if (botToken && chatId) {
      try {
        const chatResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getChat`, {
          params: { chat_id: chatId },
          timeout: 5000
        });
        
        if (chatResponse.data.ok) {
          status.telegram.chatInfo = {
            id: chatResponse.data.result.id,
            type: chatResponse.data.result.type,
            title: chatResponse.data.result.title,
            username: chatResponse.data.result.username,
            firstName: chatResponse.data.result.first_name,
            lastName: chatResponse.data.result.last_name
          };
        }
      } catch (error) {
        // Chat信息获取失败不影响整体状态，可能是权限问题
        status.telegram.chatError = `无法获取聊天信息: ${error.message}`;
      }
    }

    // 在开发环境中提供更友好的状态信息
    if (process.env.NODE_ENV === 'development') {
      if (!status.redis.connected) {
        status.redis.environment = 'development';
        status.redis.note = '开发环境：使用内存存储';
      }
      if (!status.telegram.configured) {
        status.telegram.note = '开发环境：请配置真实的Bot Token和Chat ID';
      }
    }

    console.log('系统状态检查完成:', {
      redis: status.redis.connected,
      telegram: status.telegram.configured,
      healthy: status.redis.healthy && status.telegram.healthy
    });

    res.status(200).json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('系统状态检查失败:', error);
    res.status(500).json({
      success: false,
      error: `状态检查失败: ${error.message}`
    });
  }
}