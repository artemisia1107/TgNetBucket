import { TelegramStorage } from '../../src/telegram_storage';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// 禁用Next.js的默认body解析，以便处理文件上传
export const config = {
  api: {
    bodyParser: false,
  },
};

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

export default async function handler(req, res) {
  const { method } = req;
  
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

  switch (method) {
    case 'GET':
      try {
        const files = await telegramStorage.listFiles();
        res.status(200).json({ success: true, files });
      } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({ success: false, error: '获取文件列表失败' });
      }
      break;

    case 'POST':
      // 上传文件
      try {
        const form = new IncomingForm();
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('文件解析错误:', err);
            return res.status(500).json({ 
              success: false, 
              error: `文件解析失败: ${err.message}` 
            });
          }

          // 在formidable v3中，files.file是一个数组
          const fileArray = files.file;
          if (!fileArray || !Array.isArray(fileArray) || fileArray.length === 0) {
            console.error('没有提供文件');
            return res.status(400).json({ 
              success: false, 
              error: '没有提供文件' 
            });
          }

          const [file] = fileArray; // 获取第一个文件
          if (!file || !file.filepath) {
            console.error('文件对象无效或缺少文件路径');
            return res.status(400).json({ 
              success: false, 
              error: '文件对象无效或缺少文件路径' 
            });
          }

          try {
            console.log(`开始上传文件: ${file.originalFilename}, 大小: ${file.size} bytes`);
            const fileBuffer = fs.readFileSync(file.filepath);
            const result = await telegramStorage.uploadFile(fileBuffer, file.originalFilename);
            
            console.log(`文件上传成功: ${file.originalFilename}, fileId: ${result.fileId}`);
            res.status(200).json({ 
              success: true, 
              fileId: result.fileId, 
              messageId: result.messageId 
            });
          } catch (uploadError) {
            console.error('文件上传到Telegram失败:', uploadError);
            return res.status(500).json({ 
              success: false, 
              error: `上传失败: ${uploadError.message}` 
            });
          }
        });
      } catch (error) {
        console.error('POST请求处理错误:', error);
        res.status(500).json({ 
          success: false, 
          error: `请求处理失败: ${error.message}` 
        });
      }
      break;

    case 'DELETE':
      // 删除文件
      try {
        const { messageId } = req.query;
        if (!messageId) {
          return res.status(400).json({ success: false, error: '没有提供消息ID' });
        }

        const result = await telegramStorage.deleteFile(messageId);
        res.status(200).json({ success: true, result });
      } catch (error) {
        console.error('删除文件API错误:', error);
        
        // 根据错误类型返回适当的状态码和错误信息
        if (error.message.includes('网络连接超时') || error.message.includes('timeout')) {
          res.status(408).json({ 
            success: false, 
            error: error.message,
            errorType: 'NETWORK_TIMEOUT',
            retryable: true,
            retryDelay: 5000, // 建议5秒后重试
            suggestion: '网络连接不稳定，建议稍后重试或检查网络连接'
          });
        } else if (error.message.includes('无法连接到Telegram服务器') || error.message.includes('服务器可能暂时不可用')) {
          res.status(503).json({ 
            success: false, 
            error: error.message,
            errorType: 'SERVICE_UNAVAILABLE',
            retryable: true,
            retryDelay: 10000, // 建议10秒后重试
            suggestion: 'Telegram服务暂时不可用，请稍后重试'
          });
        } else if (error.message.includes('网络连接失败') || error.message.includes('DNS配置')) {
          res.status(502).json({ 
            success: false, 
            error: error.message,
            errorType: 'NETWORK_ERROR',
            retryable: true,
            retryDelay: 3000, // 建议3秒后重试
            suggestion: '网络连接问题，请检查网络设置或稍后重试'
          });
        } else if (error.message.includes('连接被重置') || error.message.includes('ECONNRESET')) {
          res.status(502).json({ 
            success: false, 
            error: error.message,
            errorType: 'CONNECTION_RESET',
            retryable: true,
            retryDelay: 3000,
            suggestion: '网络连接不稳定，建议稍后重试'
          });
        } else if (error.message.includes('Telegram API连接失败') || error.code === 'EFATAL') {
          res.status(502).json({ 
            success: false, 
            error: error.message,
            errorType: 'API_CONNECTION_ERROR',
            retryable: true,
            retryDelay: 5000,
            suggestion: 'Telegram API连接失败，请稍后重试'
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: error.message || '删除文件时发生未知错误',
            errorType: 'UNKNOWN_ERROR',
            retryable: false,
            suggestion: '发生未知错误，请联系管理员'
          });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}