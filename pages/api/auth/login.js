/**
 * 认证登录API接口
 * 处理管理员登录验证
 */

import { validateAdminCredentials, generateAuthToken } from '../../../utils/authUtils.js';

/**
 * 处理登录请求
 * @param {import('next').NextApiRequest} req - 请求对象
 * @param {import('next').NextApiResponse} res - 响应对象
 */
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { username, password } = req.body;

    // 验证请求参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // 验证凭据
    const isValid = await validateAdminCredentials(username, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // 生成认证令牌
    const token = generateAuthToken(username);

    // 返回成功响应
    res.status(200).json({
      success: true,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}