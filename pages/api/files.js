import { TelegramStorage } from '../../src/telegram_storage';
import formidable from 'formidable';
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
      // 获取文件列表
      try {
        const files = await telegramStorage.listFiles();
        res.status(200).json({ success: true, files });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      // 上传文件
      try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('文件解析错误:', err);
            return res.status(500).json({ 
              success: false, 
              error: `文件解析失败: ${err.message}` 
            });
          }

          const file = files.file;
          if (!file) {
            console.error('没有提供文件');
            return res.status(400).json({ 
              success: false, 
              error: '没有提供文件' 
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
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}