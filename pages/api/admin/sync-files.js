import { TelegramStorage } from '../../../src/telegram_storage';

/**
 * 管理面板 - 文件同步API
 * 从Telegram重新同步文件列表到数据库
 */
export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    // 检查必要的环境变量
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(400).json({
        success: false,
        error: 'Telegram配置不完整，请检查TELEGRAM_BOT_TOKEN和TELEGRAM_CHAT_ID环境变量'
      });
    }

    console.log('开始从Telegram同步文件列表...');

    // 创建TelegramStorage实例
    const storage = new TelegramStorage(botToken, chatId);

    // 强制从Telegram同步文件列表
    const files = await storage.listFiles(true); // 传入true强制刷新

    console.log(`同步完成，共处理 ${files.length} 个文件`);

    // 统计同步结果
    const syncStats = {
      syncedCount: files.length,
      totalSize: 0,
      fileTypes: {}
    };

    files.forEach(file => {
      if (file.fileSize && typeof file.fileSize === 'number') {
        syncStats.totalSize += file.fileSize;
      }

      // 统计文件类型
      let fileType = '其他';
      if (file.fileName) {
        const ext = file.fileName.split('.').pop()?.toLowerCase();
        if (ext) {
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
            fileType = '图片';
          } else if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
            fileType = '视频';
          } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
            fileType = '音频';
          } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
            fileType = '文档';
          } else {
            fileType = ext.toUpperCase();
          }
        }
      }
      syncStats.fileTypes[fileType] = (syncStats.fileTypes[fileType] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      message: '文件同步完成',
      syncedCount: syncStats.syncedCount,
      data: syncStats
    });

  } catch (error) {
    console.error('文件同步失败:', error);
    res.status(500).json({
      success: false,
      error: `同步失败: ${error.message}`
    });
  }
}