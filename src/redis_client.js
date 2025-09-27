import { Redis } from '@upstash/redis';

/**
 * Redis客户端配置和连接管理
 * 使用Upstash Redis作为持久化存储
 */
class RedisClient {
  constructor() {
    // 从环境变量获取Upstash Redis配置
    this.redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!this.redisUrl || !this.redisToken) {
      console.warn('Upstash Redis配置未找到，将使用内存存储（仅用于开发环境）');
      this.redis = null;
      this.memoryStore = new Map(); // 开发环境的内存存储
    } else {
      // 初始化Upstash Redis客户端
      this.redis = new Redis({
        url: this.redisUrl,
        token: this.redisToken,
      });
    }
  }

  /**
   * 获取Redis客户端实例
   * @returns {Redis|null} Redis客户端实例或null（如果未配置）
   */
  getClient() {
    return this.redis;
  }

  /**
   * 检查Redis连接是否可用
   * @returns {boolean} 连接状态
   */
  isConnected() {
    return this.redis !== null;
  }

  /**
   * 设置键值对
   * @param {string} key - 键
   * @param {any} value - 值
   * @param {number} [ttl] - 过期时间（秒）
   * @returns {Promise<boolean>} 操作结果
   */
  async set(key, value, ttl = null) {
    try {
      if (this.redis) {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          await this.redis.setex(key, ttl, serializedValue);
        } else {
          await this.redis.set(key, serializedValue);
        }
        return true;
      } else {
        // 使用内存存储作为后备
        this.memoryStore.set(key, { value, timestamp: Date.now(), ttl });
        return true;
      }
    } catch (error) {
      console.error('Redis设置失败:', error);
      return false;
    }
  }

  /**
   * 获取值
   * @param {string} key - 键
   * @returns {Promise<any|null>} 值或null
   */
  async get(key) {
    try {
      if (this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // 使用内存存储作为后备
        const item = this.memoryStore.get(key);
        if (!item) return null;
        
        // 检查是否过期
        if (item.ttl && (Date.now() - item.timestamp) > item.ttl * 1000) {
          this.memoryStore.delete(key);
          return null;
        }
        
        return item.value;
      }
    } catch (error) {
      console.error('Redis获取失败:', error);
      return null;
    }
  }

  /**
   * 删除键
   * @param {string} key - 键
   * @returns {Promise<boolean>} 操作结果
   */
  async del(key) {
    try {
      if (this.redis) {
        await this.redis.del(key);
        return true;
      } else {
        // 使用内存存储作为后备
        return this.memoryStore.delete(key);
      }
    } catch (error) {
      console.error('Redis删除失败:', error);
      return false;
    }
  }

  /**
   * 向列表添加元素
   * @param {string} key - 列表键
   * @param {any} value - 要添加的值
   * @returns {Promise<boolean>} 操作结果
   */
  async lpush(key, value) {
    try {
      if (this.redis) {
        await this.redis.lpush(key, JSON.stringify(value));
        return true;
      } else {
        // 使用内存存储作为后备
        const list = this.memoryStore.get(key)?.value || [];
        list.unshift(value);
        this.memoryStore.set(key, { value: list, timestamp: Date.now() });
        return true;
      }
    } catch (error) {
      console.error('Redis列表添加失败:', error);
      return false;
    }
  }

  /**
   * 获取列表所有元素
   * @param {string} key - 列表键
   * @returns {Promise<Array>} 列表元素
   */
  async lrange(key, start = 0, end = -1) {
    try {
      if (this.redis) {
        const items = await this.redis.lrange(key, start, end);
        return items.map(item => JSON.parse(item));
      } else {
        // 使用内存存储作为后备
        const list = this.memoryStore.get(key)?.value || [];
        if (end === -1) end = list.length - 1;
        return list.slice(start, end + 1);
      }
    } catch (error) {
      console.error('Redis列表获取失败:', error);
      return [];
    }
  }

  /**
   * 从列表中移除元素
   * @param {string} key - 列表键
   * @param {any} value - 要移除的值
   * @returns {Promise<boolean>} 操作结果
   */
  async lrem(key, value) {
    try {
      if (this.redis) {
        await this.redis.lrem(key, 0, JSON.stringify(value));
        return true;
      } else {
        // 使用内存存储作为后备
        const list = this.memoryStore.get(key)?.value || [];
        const index = list.findIndex(item => JSON.stringify(item) === JSON.stringify(value));
        if (index !== -1) {
          list.splice(index, 1);
          this.memoryStore.set(key, { value: list, timestamp: Date.now() });
        }
        return true;
      }
    } catch (error) {
      console.error('Redis列表移除失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const redisClient = new RedisClient();

export { redisClient, RedisClient };