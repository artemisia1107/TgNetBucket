/**
 * 开发工具配置文件
 * 提供开发过程中的实用工具和脚本配置
 */

const path = require('path');
const fs = require('fs');

const devConfig = {
  // 开发服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    https: process.env.HTTPS === 'true',
    proxy: {
      // API 代理配置
      '/api/telegram': {
        target: 'https://api.telegram.org',
        changeOrigin: true,
        pathRewrite: {
          '^/api/telegram': ''
        }
      }
    }
  },

  // 热重载配置
  hotReload: {
    enabled: process.env.NODE_ENV === 'development',
    // 监听的文件类型
    watchFiles: [
      'pages/**/*.{js,jsx,ts,tsx}',
      'components/**/*.{js,jsx,ts,tsx}',
      'utils/**/*.{js,jsx,ts,tsx}',
      'constants/**/*.{js,jsx,ts,tsx}',
      'hooks/**/*.{js,jsx,ts,tsx}',
      'public/styles/**/*.css'
    ],
    // 忽略的文件
    ignoreFiles: [
      'node_modules/**',
      '.next/**',
      'out/**',
      '*.log'
    ]
  },

  // 代码生成器配置
  generators: {
    // 组件生成器
    component: {
      template: path.join(__dirname, 'templates/component.template.js'),
      outputDir: path.join(__dirname, 'components'),
      // 组件模板变量
      variables: {
        author: 'TgNetBucket Team',
        license: 'MIT'
      }
    },
    // API 路由生成器
    apiRoute: {
      template: path.join(__dirname, 'templates/api-route.template.js'),
      outputDir: path.join(__dirname, 'pages/api'),
      variables: {
        author: 'TgNetBucket Team'
      }
    },
    // Hook 生成器
    hook: {
      template: path.join(__dirname, 'templates/hook.template.js'),
      outputDir: path.join(__dirname, 'hooks'),
      variables: {
        author: 'TgNetBucket Team'
      }
    }
  },

  // 代码分析配置
  analysis: {
    // 包大小分析
    bundleAnalyzer: {
      enabled: process.env.ANALYZE === 'true',
      openAnalyzer: true,
      analyzerMode: 'server',
      analyzerPort: 8888
    },
    // 依赖分析
    dependencies: {
      // 检查未使用的依赖
      checkUnused: true,
      // 检查过时的依赖
      checkOutdated: true,
      // 检查安全漏洞
      checkVulnerabilities: true
    }
  },

  // 代码质量工具
  quality: {
    // 代码格式化
    formatting: {
      // 保存时自动格式化
      formatOnSave: true,
      // 格式化的文件类型
      fileTypes: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.md'],
      // Prettier 配置
      prettier: {
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2
      }
    },
    // 代码检查
    linting: {
      // 保存时自动检查
      lintOnSave: true,
      // 自动修复
      autoFix: true,
      // ESLint 配置
      eslint: {
        cache: true,
        cacheLocation: '.eslintcache',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },

  // 测试配置
  testing: {
    // 测试运行器
    runner: 'mocha',
    // 测试环境
    environment: 'node',
    // 测试文件模式
    testMatch: [
      'tests/**/*.test.js',
      'tests/**/*.spec.js'
    ],
    // 覆盖率配置
    coverage: {
      enabled: true,
      reporter: ['text', 'html', 'lcov'],
      outputDir: 'coverage',
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // 监听模式
    watch: {
      enabled: false,
      watchFiles: [
        'utils/**/*.js',
        'components/**/*.js',
        'tests/**/*.js'
      ]
    }
  },

  // 构建优化
  optimization: {
    // 代码分割
    codeSplitting: {
      enabled: true,
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000
    },
    // 压缩配置
    compression: {
      enabled: process.env.NODE_ENV === 'production',
      algorithm: 'gzip',
      threshold: 8192
    },
    // 缓存配置
    caching: {
      enabled: true,
      type: 'filesystem',
      cacheDirectory: '.next/cache'
    }
  },

  // 调试工具
  debugging: {
    // 源码映射
    sourceMap: {
      enabled: process.env.NODE_ENV === 'development',
      type: 'eval-source-map'
    },
    // 调试信息
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
    // React 开发工具
    reactDevTools: process.env.NODE_ENV === 'development'
  },

  // 性能监控
  performance: {
    // 性能预算
    budget: {
      maxAssetSize: 250000,
      maxEntrypointSize: 250000
    },
    // 性能提示
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    // Web Vitals 监控
    webVitals: {
      enabled: true,
      reportWebVitals: true
    }
  },

  // 开发工具
  tools: {
    // 文件监听器
    watcher: {
      enabled: true,
      options: {
        ignored: /node_modules/,
        persistent: true
      }
    },
    // 自动重启
    autoRestart: {
      enabled: true,
      delay: 1000,
      signal: 'SIGTERM'
    },
    // 错误覆盖
    errorOverlay: {
      enabled: process.env.NODE_ENV === 'development',
      showWarnings: true,
      showErrors: true
    }
  },

  // 环境变量管理
  env: {
    // 环境变量文件
    files: [
      '.env.local',
      '.env.development',
      '.env.production'
    ],
    // 必需的环境变量
    required: [
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_CHAT_ID'
    ],
    // 可选的环境变量
    optional: [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD'
    ]
  },

  // 脚本配置
  scripts: {
    // 预提交钩子
    preCommit: [
      'npm run lint',
      'npm run format:check',
      'npm run type-check'
    ],
    // 预推送钩子
    prePush: [
      'npm run test',
      'npm run build'
    ],
    // 发布前钩子
    preRelease: [
      'npm run test:coverage',
      'npm run build',
      'npm run analyze'
    ]
  }
};

// 工具函数
const utils = {
  /**
   * 检查环境变量
   */
  checkEnvVars() {
    const missing = devConfig.env.required.filter(
      varName => !process.env[varName]
    );
    
    if (missing.length > 0) {
      console.warn('⚠️  Missing required environment variables:');
      missing.forEach(varName => {
        console.warn(`   - ${varName}`);
      });
      console.warn('   Please check your .env.local file');
    }
    
    return missing.length === 0;
  },

  /**
   * 获取项目信息
   */
  getProjectInfo() {
    const packageJson = require('./package.json');
    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      author: packageJson.author,
      license: packageJson.license
    };
  },

  /**
   * 检查端口是否可用
   */
  async checkPort(port) {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
  },

  /**
   * 生成开发服务器 URL
   */
  getServerUrl() {
    const { host, port, https } = devConfig.server;
    const protocol = https ? 'https' : 'http';
    return `${protocol}://${host}:${port}`;
  },

  /**
   * 打印开发信息
   */
  printDevInfo() {
    const info = this.getProjectInfo();
    const serverUrl = this.getServerUrl();
    
    console.log('\n🚀 Development Server Starting...\n');
    console.log(`📦 Project: ${info.name} v${info.version}`);
    console.log(`🌐 Server: ${serverUrl}`);
    console.log(`📝 Description: ${info.description}`);
    console.log(`👤 Author: ${info.author}`);
    console.log(`📄 License: ${info.license}\n`);
  }
};

module.exports = {
  devConfig,
  utils,
  ...devConfig
};