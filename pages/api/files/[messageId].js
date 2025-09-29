import { TelegramStorage } from '../../../src/telegram_storage';

/**
 * 验证环境变量是否配置正确
 * @returns {Object} 验证结果
 */
function validateEnvironmentVariables() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken) {
    return { valid: false, error: '缺少环境变量 TELEGRAM_BOT_TOKEN' };
  }
  
  if (!chatId) {
    return { valid: false, error: '缺少环境变量 TELEGRAM_CHAT_ID' };
  }
  
  return { valid: true, botToken, chatId };
}

/**
 * 处理单个文件的删除请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export default async function handler(req, res) {
  const { method, query } = req;
  const { messageId } = query;

  // 只允许DELETE方法
  if (method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${method} Not Allowed` 
    });
  }

  // 验证messageId参数
  if (!messageId) {
    return res.status(400).json({ 
      success: false, 
      error: '没有提供消息ID' 
    });
  }

  // 验证环境变量
  const envValidation = validateEnvironmentVariables();
  if (!envValidation.valid) {
    return res.status(500).json({ 
      success: false, 
      error: `配置错误: ${envValidation.error}` 
    });
  }

  // 创建TelegramStorage实例
  const telegramStorage = new TelegramStorage({
    botToken: envValidation.botToken,
    chatId: envValidation.chatId
  });

  try {
    console.log(`开始删除文件，消息ID: ${messageId}`);
    const result = await telegramStorage.deleteFile(messageId);
    
    console.log(`文件删除成功，消息ID: ${messageId}`);
    res.status(200).json({ 
      success: true, 
      result,
      messageId 
    });
  } catch (error) {
    console.error(`删除文件API错误 (消息ID: ${messageId}):`, error);
    
    // 根据错误类型返回适当的状态码和错误信息
    if (error.message.includes('网络连接超时') || error.message.includes('timeout')) {
      res.status(408).json({ 
        success: false, 
        error: error.message,
        errorType: 'NETWORK_TIMEOUT',
        retryable: true,
        retryDelay: 5000, // 建议5秒后重试
        suggestion: '网络连接不稳定，建议稍后重试或检查网络连接',
        messageId
      });
    } else if (error.message.includes('无法连接到Telegram服务器') || error.message.includes('服务器可能暂时不可用')) {
      res.status(503).json({ 
        success: false, 
        error: error.message,
        errorType: 'SERVICE_UNAVAILABLE',
        retryable: true,
        retryDelay: 10000, // 建议10秒后重试
        suggestion: 'Telegram服务暂时不可用，请稍后重试',
        messageId
      });
    } else if (error.message.includes('网络连接失败') || error.message.includes('DNS配置')) {
      res.status(502).json({ 
        success: false, 
        error: error.message,
        errorType: 'NETWORK_ERROR',
        retryable: true,
        retryDelay: 3000, // 建议3秒后重试
        suggestion: '网络连接问题，请检查网络设置或稍后重试',
        messageId
      });
    } else if (error.message.includes('连接被重置') || error.message.includes('ECONNRESET')) {
      res.status(502).json({ 
        success: false, 
        error: error.message,
        errorType: 'CONNECTION_RESET',
        retryable: true,
        retryDelay: 3000,
        suggestion: '网络连接不稳定，建议稍后重试',
        messageId
      });
    } else if (error.message.includes('Telegram API连接失败') || error.code === 'EFATAL') {
      res.status(502).json({ 
        success: false, 
        error: error.message,
        errorType: 'API_CONNECTION_ERROR',
        retryable: true,
        retryDelay: 5000,
        suggestion: 'Telegram API连接失败，请稍后重试',
        messageId
      });
    } else if (error.message.includes('文件不存在') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false, 
        error: '文件不存在或已被删除',
        errorType: 'FILE_NOT_FOUND',
        retryable: false,
        suggestion: '文件可能已被删除或不存在',
        messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.message || '删除文件时发生未知错误',
        errorType: 'UNKNOWN_ERROR',
        retryable: false,
        suggestion: '发生未知错误，请联系管理员',
        messageId
      });
    }
  }
}