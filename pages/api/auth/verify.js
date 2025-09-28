/**
 * 认证验证API接口
 * 验证当前认证状态
 */

import { validateAuthToken } from '../../../utils/authUtils.js';

/**
 * 处理认证验证请求
 * @param {import('next').NextApiRequest} req - 请求对象
 * @param {import('next').NextApiResponse} res - 响应对象
 */
export default async function handler(req, res) {
  // 只允许 GET 和 POST 请求
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // 从请求头或请求体获取令牌
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.body?.token || 
                  req.query?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'No token provided'
      });
    }

    // 验证令牌
    const isValid = validateAuthToken(token);

    if (isValid) {
      res.status(200).json({
        success: true,
        authenticated: true,
        message: 'Token is valid'
      });
    } else {
      res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Verify API error:', error);
    res.status(500).json({
      success: false,
      authenticated: false,
      error: 'Internal server error'
    });
  }
}