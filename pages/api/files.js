import { TelegramStorage } from '../../src/telegram_storage';
import formidable from 'formidable';
import fs from 'fs';

// 禁用Next.js的默认body解析，以便处理文件上传
export const config = {
  api: {
    bodyParser: false,
  },
};

// 创建TelegramStorage实例
const telegramStorage = new TelegramStorage({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});

export default async function handler(req, res) {
  const { method } = req;

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
            return res.status(500).json({ success: false, error: err.message });
          }

          const file = files.file;
          if (!file) {
            return res.status(400).json({ success: false, error: '没有提供文件' });
          }

          const fileBuffer = fs.readFileSync(file.filepath);
          const result = await telegramStorage.uploadFile(fileBuffer, file.originalFilename);
          
          res.status(200).json({ success: true, fileId: result.fileId, messageId: result.messageId });
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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