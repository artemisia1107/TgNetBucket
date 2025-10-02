/**
 * 健康检查API端点
 * 用于网络监控器测试应用程序的健康状态
 */

export default function handler(req, res) {
  // 只允许 GET 和 HEAD 请求
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      icon: 'fas fa-times-circle'
    });
  }

  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
      icon: 'fas fa-heart text-success'
    };

    // 检查环境变量
    const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      healthStatus.status = 'degraded';
      healthStatus.warnings = [`缺少环境变量: ${missingEnvVars.join(', ')}`];
      healthStatus.icon = 'fas fa-exclamation-triangle text-warning';
    }

    // 对于 HEAD 请求，只返回状态码
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }

    // 对于 GET 请求，返回详细的健康状态
    res.status(200).json(healthStatus);
    return;

  } catch (error) {
    console.error('健康检查失败:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      icon: 'fas fa-times-circle text-danger'
    };

    // 对于 HEAD 请求，返回错误状态码
    if (req.method === 'HEAD') {
      res.status(500).end();
      return;
    }

    res.status(500).json(errorResponse);
    return;
  }
}