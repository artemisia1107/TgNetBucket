/**
 * 项目配置文件
 * 统一管理项目级别的配置和元数据
 */

const projectConfig = {
  // 项目基本信息
  project: {
    name: 'TgNetBucket',
    version: '1.0.0',
    description: '使用Telegram作为存储后端的现代化文件存储服务',
    author: 'TgNetBucket Team',
    license: 'MIT',
    homepage: 'https://github.com/artemisia1107/TgNetBucket',
    repository: 'https://github.com/artemisia1107/TgNetBucket.git'
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: '.next',
    // 静态资源目录
    assetsDir: 'static',
    // 是否生成 source map
    sourceMap: process.env.NODE_ENV === 'development',
    // 是否压缩代码
    minify: process.env.NODE_ENV === 'production',
    // 目标浏览器
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // 分包策略
    splitChunks: {
      vendor: ['react', 'react-dom', 'next'],
      common: ['axios', 'formidable']
    }
  },

  // 开发服务器配置
  dev: {
    port: 3000,
    host: 'localhost',
    https: false,
    open: true,
    overlay: true,
    hot: true,
    liveReload: true
  },

  // 路径配置
  paths: {
    src: './src',
    components: './components',
    pages: './pages',
    utils: './utils',
    constants: './constants',
    hooks: './hooks',
    public: './public',
    styles: './public/styles',
    tests: './tests',
    docs: './docs'
  },

  // 文件配置
  files: {
    // 支持的文件扩展名
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // 忽略的文件模式
    ignore: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      '*.log',
      '.DS_Store',
      'Thumbs.db'
    ],
    // 静态资源扩展名
    assets: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  },

  // 代码质量配置
  quality: {
    // ESLint 配置
    eslint: {
      enabled: true,
      configFile: '.eslintrc.json',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      cache: true,
      fix: true
    },
    // Prettier 配置
    prettier: {
      enabled: true,
      configFile: '.prettierrc',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.md'],
      write: true
    },
    // TypeScript 配置
    typescript: {
      enabled: true,
      configFile: 'tsconfig.json',
      strict: true,
      skipLibCheck: true
    }
  },

  // 测试配置
  testing: {
    // 测试框架
    framework: 'mocha',
    // 测试文件模式
    testMatch: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    // 覆盖率配置
    coverage: {
      enabled: true,
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      exclude: [
        'tests/**',
        'coverage/**',
        '.next/**',
        'out/**'
      ]
    }
  },

  // 部署配置
  deployment: {
    // 支持的平台
    platforms: ['vercel', 'netlify', 'docker'],
    // 环境配置
    environments: {
      development: {
        NODE_ENV: 'development',
        DEBUG: true
      },
      staging: {
        NODE_ENV: 'production',
        DEBUG: false
      },
      production: {
        NODE_ENV: 'production',
        DEBUG: false
      }
    },
    // 构建命令
    buildCommand: 'npm run build',
    // 启动命令
    startCommand: 'npm start',
    // 输出目录
    publishDir: '.next'
  },

  // 性能配置
  performance: {
    // 包大小限制
    bundleSize: {
      maxAssetSize: 250000,
      maxEntrypointSize: 250000
    },
    // 图片优化
    images: {
      domains: ['telegram.org', 'api.telegram.org'],
      formats: ['image/webp', 'image/avif'],
      sizes: [16, 32, 48, 64, 96, 128, 256, 384]
    },
    // 缓存策略
    cache: {
      static: '31536000', // 1年
      dynamic: '0'
    }
  },

  // 安全配置
  security: {
    // 内容安全策略
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'https://api.telegram.org']
    },
    // 安全头
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },

  // 监控配置
  monitoring: {
    // 错误追踪
    errorTracking: {
      enabled: false,
      service: 'sentry',
      dsn: process.env.SENTRY_DSN
    },
    // 性能监控
    performance: {
      enabled: false,
      service: 'web-vitals'
    },
    // 日志配置
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      transports: ['console', 'file']
    }
  },

  // 功能开关
  features: {
    // 文件上传
    fileUpload: true,
    // 文件预览
    filePreview: true,
    // 短链接
    shortLinks: true,
    // 管理面板
    adminPanel: true,
    // 用户认证
    authentication: true,
    // 文件分享
    fileSharing: true,
    // 批量操作
    batchOperations: true,
    // 搜索功能
    search: true,
    // 统计分析
    analytics: false
  }
};

// 环境特定配置
const envConfig = {
  development: {
    ...projectConfig,
    dev: {
      ...projectConfig.dev,
      overlay: true,
      hot: true
    },
    build: {
      ...projectConfig.build,
      sourceMap: true,
      minify: false
    }
  },
  production: {
    ...projectConfig,
    build: {
      ...projectConfig.build,
      sourceMap: false,
      minify: true
    },
    monitoring: {
      ...projectConfig.monitoring,
      errorTracking: {
        ...projectConfig.monitoring.errorTracking,
        enabled: true
      }
    }
  }
};

// 获取当前环境配置
const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return envConfig[env] || projectConfig;
};

// 导出配置
module.exports = {
  projectConfig,
  envConfig,
  getCurrentConfig,
  // 便捷访问
  ...getCurrentConfig()
};

// ES6 模块导出（如果支持）
if (typeof exports !== 'undefined') {
  exports.projectConfig = projectConfig;
  exports.envConfig = envConfig;
  exports.getCurrentConfig = getCurrentConfig;
  exports.default = getCurrentConfig();
}