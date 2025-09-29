/**
 * Next.js API 路由模板
 * 用于生成标准化的 API 路由
 */

const apiRouteTemplate = `import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest, handleError, createResponse } from '@/utils/api';
import { authenticate } from '@/utils/auth';
import { rateLimit } from '@/utils/rateLimit';

/**
 * API 响应数据类型
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 请求查询参数类型
 */
interface QueryParams {
  page?: string;
  limit?: string;
  sort?: 'asc' | 'desc';
  [key: string]: string | string[] | undefined;
}

/**
 * 请求体类型
 */
interface RequestBody {
  name?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * 扩展的 API 请求类型
 */
interface ExtendedApiRequest extends NextApiRequest {
  query: QueryParams;
  body: RequestBody;
}

/**
 * {{routeName}} API 路由
 * {{description}}
 * 
 * @author {{author}}
 * @since {{date}}
 */

// API 路由配置
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '8mb',
  },
};

// 请求验证规则
const validationRules = {
  GET: {
    query: {
      // 查询参数验证规则
      page: { type: 'number', min: 1, default: 1 },
      limit: { type: 'number', min: 1, max: 100, default: 10 },
      sort: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
    }
  },
  POST: {
    body: {
      // 请求体验证规则
      name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
      description: { type: 'string', maxLength: 500 },
      tags: { type: 'array', items: { type: 'string' } }
    }
  },
  PUT: {
    body: {
      // 更新请求验证规则
      id: { type: 'string', required: true },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', maxLength: 500 }
    }
  },
  DELETE: {
    query: {
      // 删除请求验证规则
      id: { type: 'string', required: true }
    }
  }
};

/**
 * 处理 GET 请求
 * 获取{{routeName}}列表或详情
 */
async function handleGet(req: ExtendedApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { page, limit, sort, id } = req.query;

    // 如果有 ID，返回单个项目详情
    if (id) {
      const item = await get{{routeName}}ById(id as string);
      if (!item) {
        return createResponse(res, 404, null, '{{routeName}} not found');
      }
      return createResponse(res, 200, item, 'Success');
    }

    // 返回列表
    const options = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      sort: (sort as 'asc' | 'desc') || 'desc'
    };

    const result = await get{{routeName}}List(options);
    return createResponse(res, 200, result, 'Success');

  } catch (error: any) {
    console.error('GET {{routeName}} Error:', error);
    return handleError(res, error);
  }
}

/**
 * 处理 POST 请求
 * 创建新的{{routeName}}
 */
async function handlePost(req: ExtendedApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { name, description, tags } = req.body;

    // 检查是否已存在
    const existing = await find{{routeName}}ByName(name);
    if (existing) {
      return createResponse(res, 409, null, '{{routeName}} already exists');
    }

    // 创建新项目
    const newItem = await create{{routeName}}({
      name,
      description,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return createResponse(res, 201, newItem, '{{routeName}} created successfully');

  } catch (error) {
    console.error('POST {{routeName}} Error:', error);
    return handleError(res, error);
  }
}

/**
 * 处理 PUT 请求
 * 更新{{routeName}}
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, description } = req.body;

    // 检查项目是否存在
    const existing = await get{{routeName}}ById(id);
    if (!existing) {
      return createResponse(res, 404, null, '{{routeName}} not found');
    }

    // 更新项目
    const updatedItem = await update{{routeName}}(id, {
      name,
      description,
      updatedAt: new Date()
    });

    return createResponse(res, 200, updatedItem, '{{routeName}} updated successfully');

  } catch (error) {
    console.error('PUT {{routeName}} Error:', error);
    return handleError(res, error);
  }
}

/**
 * 处理 DELETE 请求
 * 删除{{routeName}}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    // 检查项目是否存在
    const existing = await get{{routeName}}ById(id as string);
    if (!existing) {
      return createResponse(res, 404, null, '{{routeName}} not found');
    }

    // 删除项目
    await delete{{routeName}}(id as string);

    return createResponse(res, 200, null, '{{routeName}} deleted successfully');

  } catch (error) {
    console.error('DELETE {{routeName}} Error:', error);
    return handleError(res, error);
  }
}

/**
 * 主处理函数
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 速率限制
    await rateLimit(req, res);

    // 请求验证
    const validation = validationRules[req.method as keyof typeof validationRules];
    if (validation) {
      const isValid = await validateRequest(req, validation);
      if (!isValid) {
        return createResponse(res, 400, null, 'Invalid request parameters');
      }
    }

    // 身份验证（根据需要启用）
    // const user = await authenticate(req);
    // if (!user) {
    //   return createResponse(res, 401, null, 'Unauthorized');
    // }

    // 根据请求方法分发处理
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return createResponse(res, 405, null, \`Method \${req.method} Not Allowed\`);
    }

  } catch (error) {
    console.error('API Handler Error:', error);
    return handleError(res, error);
  }
}

// 数据库操作函数（需要根据实际数据库实现）

/**
 * 根据 ID 获取{{routeName}}
 */
async function get{{routeName}}ById(id: string) {
  // TODO: 实现数据库查询逻辑
  throw new Error('Not implemented');
}

/**
 * 获取{{routeName}}列表
 */
async function get{{routeName}}List(options: {
  page: number;
  limit: number;
  sort: string;
}) {
  // TODO: 实现数据库查询逻辑
  throw new Error('Not implemented');
}

/**
 * 根据名称查找{{routeName}}
 */
async function find{{routeName}}ByName(name: string) {
  // TODO: 实现数据库查询逻辑
  throw new Error('Not implemented');
}

/**
 * 创建{{routeName}}
 */
async function create{{routeName}}(data: any) {
  // TODO: 实现数据库创建逻辑
  throw new Error('Not implemented');
}

/**
 * 更新{{routeName}}
 */
async function update{{routeName}}(id: string, data: any) {
  // TODO: 实现数据库更新逻辑
  throw new Error('Not implemented');
}

/**
 * 删除{{routeName}}
 */
async function delete{{routeName}}(id: string) {
  // TODO: 实现数据库删除逻辑
  throw new Error('Not implemented');
}
`;

const apiTestTemplate = `import { createMocks } from 'node-mocks-http';
import handler from './{{routeName}}';

/**
 * {{routeName}} API 路由测试
 * 
 * @author {{author}}
 * @since {{date}}
 */
describe('/api/{{routeName}}', () => {
  // GET 请求测试
  describe('GET', () => {
    test('should return {{routeName}} list', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should return single {{routeName}} by id', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'test-id'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    test('should return 404 for non-existent {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'non-existent-id'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  // POST 请求测试
  describe('POST', () => {
    test('should create new {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test {{routeName}}',
          description: 'Test description',
          tags: ['test', 'example']
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Test {{routeName}}');
    });

    test('should return 400 for invalid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // 缺少必需的 name 字段
          description: 'Test description'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should return 409 for duplicate {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Existing {{routeName}}',
          description: 'Test description'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  // PUT 请求测试
  describe('PUT', () => {
    test('should update existing {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'existing-id',
          name: 'Updated {{routeName}}',
          description: 'Updated description'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated {{routeName}}');
    });

    test('should return 404 for non-existent {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'non-existent-id',
          name: 'Updated {{routeName}}'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  // DELETE 请求测试
  describe('DELETE', () => {
    test('should delete existing {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'existing-id'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should return 404 for non-existent {{routeName}}', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'non-existent-id'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  // 方法不允许测试
  describe('Method Not Allowed', () => {
    test('should return 405 for unsupported method', async () => {
      const { req, res } = createMocks({
        method: 'PATCH'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  // CORS 测试
  describe('CORS', () => {
    test('should handle OPTIONS request', async () => {
      const { req, res } = createMocks({
        method: 'OPTIONS'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
      expect(res.getHeader('Access-Control-Allow-Methods')).toContain('GET');
    });
  });
});
`;

module.exports = {
  apiRouteTemplate,
  apiTestTemplate
};