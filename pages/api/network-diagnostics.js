/**
 * 网络诊断 API 端点
 * 提供网络连接状态检测和诊断功能
 */

import { TelegramStorage } from '../../src/telegram_storage.js';

/**
 * 网络诊断 API 处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export default async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '方法不被允许',
      errorType: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // 检查必要的环境变量
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        success: false,
        error: 'Telegram 配置缺失',
        errorType: 'CONFIG_MISSING',
        details: {
          hasBotToken: !!botToken,
          hasChatId: !!chatId
        }
      });
    }

    // 创建 TelegramStorage 实例
    const telegramStorage = new TelegramStorage({
      botToken,
      chatId
    });

    console.log('[网络诊断] 开始执行网络连接诊断...');
    
    // 执行网络诊断
    const diagnostics = await telegramStorage.diagnoseNetworkConnection();
    
    // 计算总体健康状态
    const overallHealth = {
      status: 'healthy',
      score: 0,
      maxScore: 3,
      issues: []
    };

    // 评估各项连接状态
    if (diagnostics.dnsResolution) overallHealth.score++;
    else overallHealth.issues.push('DNS 解析失败');

    if (diagnostics.internetConnection) overallHealth.score++;
    else overallHealth.issues.push('基本网络连接失败');

    if (diagnostics.telegramApiReachable) overallHealth.score++;
    else overallHealth.issues.push('Telegram API 不可达');

    // 确定总体状态
    if (overallHealth.score === overallHealth.maxScore) {
      overallHealth.status = 'healthy';
    } else if (overallHealth.score >= 2) {
      overallHealth.status = 'warning';
    } else {
      overallHealth.status = 'critical';
    }

    // 添加建议
    const suggestions = [];
    if (!diagnostics.dnsResolution) {
      suggestions.push({
        icon: 'fas fa-cog',
        title: 'DNS 配置检查',
        description: '尝试更换 DNS 服务器（如 8.8.8.8 或 1.1.1.1）'
      });
    }
    
    if (!diagnostics.internetConnection) {
      suggestions.push({
        icon: 'fas fa-wifi',
        title: '网络连接检查',
        description: '检查网络连接状态和防火墙设置'
      });
    }
    
    if (!diagnostics.telegramApiReachable) {
      suggestions.push({
        icon: 'fas fa-shield-alt',
        title: 'Telegram 访问检查',
        description: '检查是否需要代理或 VPN 来访问 Telegram 服务'
      });
    }

    console.log('[网络诊断] 诊断完成，总体状态:', overallHealth.status);

    // 返回诊断结果
    res.status(200).json({
      success: true,
      data: {
        ...diagnostics,
        overallHealth,
        suggestions,
        performedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[网络诊断] 诊断过程出错:', error);
    
    res.status(500).json({
      success: false,
      error: '网络诊断失败',
      errorType: 'DIAGNOSTIC_ERROR',
      details: {
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}