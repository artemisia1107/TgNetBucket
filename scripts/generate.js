#!/usr/bin/env node

/**
 * 代码生成器脚本
 * 用于根据模板快速生成组件、API 路由和 Hook
 * 
 * 使用方法：
 * npm run generate component MyComponent
 * npm run generate api-route users
 * npm run generate hook useMyHook
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 模板配置
const templates = {
  component: {
    outputDir: 'components',
    template: require('../templates/component.template.js'),
    files: [
      { name: '{{componentName}}.tsx', template: 'componentTemplate' },
      { name: '{{componentName}}.module.css', template: 'styleTemplate' },
      { name: '{{componentName}}.test.tsx', template: 'testTemplate' },
      { name: '{{componentName}}.stories.tsx', template: 'storyTemplate' }
    ]
  },
  'api-route': {
    outputDir: 'pages/api',
    template: require('../templates/api-route.template.js'),
    files: [
      { name: '{{routeName}}.ts', template: 'apiRouteTemplate' },
      { name: '{{routeName}}.test.ts', template: 'apiTestTemplate' }
    ]
  },
  hook: {
    outputDir: 'hooks',
    template: require('../templates/hook.template.js'),
    files: [
      { name: '{{hookName}}.ts', template: 'hookTemplate' },
      { name: '{{hookName}}.test.ts', template: 'hookTestTemplate' },
      { name: '{{hookName}}.md', template: 'hookDocTemplate' }
    ]
  }
};

// 工具函数
const utils = {
  /**
   * 将字符串转换为 PascalCase
   */
  toPascalCase(str) {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^(.)/, (_, char) => char.toUpperCase());
  },

  /**
   * 将字符串转换为 camelCase
   */
  toCamelCase(str) {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  },

  /**
   * 将字符串转换为 kebab-case
   */
  toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  /**
   * 获取当前日期字符串
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * 确保目录存在
   */
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },

  /**
   * 替换模板变量
   */
  replaceTemplateVars(template, vars) {
    let result = template;
    Object.keys(vars).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, vars[key]);
    });
    return result;
  },

  /**
   * 检查文件是否存在
   */
  fileExists(filePath) {
    return fs.existsSync(filePath);
  },

  /**
   * 写入文件
   */
  writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  },

  /**
   * 读取用户输入
   */
  async askQuestion(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
};

// 生成器类
class Generator {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * 生成代码
   */
  async generate(type, name, options = {}) {
    const config = templates[type];
    if (!config) {
      throw new Error(`Unknown template type: ${type}`);
    }

    console.log(`🚀 Generating ${type}: ${name}`);

    // 准备变量
    const vars = await this.prepareVariables(type, name, options);
    
    // 创建输出目录
    const outputDir = path.join(this.projectRoot, config.outputDir);
    utils.ensureDir(outputDir);

    // 生成文件
    const generatedFiles = [];
    for (const fileConfig of config.files) {
      const fileName = utils.replaceTemplateVars(fileConfig.name, vars);
      const filePath = path.join(outputDir, fileName);

      // 检查文件是否已存在
      if (utils.fileExists(filePath) && !options.force) {
        const overwrite = await utils.askQuestion(
          `File ${fileName} already exists. Overwrite? (y/N): `
        );
        if (overwrite.toLowerCase() !== 'y') {
          console.log(`⏭️  Skipping ${fileName}`);
          continue;
        }
      }

      // 生成文件内容
      const template = config.template[fileConfig.template];
      const content = utils.replaceTemplateVars(template, vars);

      // 写入文件
      utils.writeFile(filePath, content);
      generatedFiles.push(filePath);
      console.log(`✅ Generated ${fileName}`);
    }

    console.log(`\n🎉 Successfully generated ${generatedFiles.length} files:`);
    generatedFiles.forEach(file => {
      console.log(`   - ${path.relative(this.projectRoot, file)}`);
    });

    return generatedFiles;
  }

  /**
   * 准备模板变量
   */
  async prepareVariables(type, name, options) {
    const baseVars = {
      author: 'TgNetBucket Team',
      date: utils.getCurrentDate(),
      description: options.description || `Generated ${type}`
    };

    switch (type) {
      case 'component':
        return {
          ...baseVars,
          componentName: utils.toPascalCase(name),
          description: options.description || `${utils.toPascalCase(name)} component`
        };

      case 'api-route':
        return {
          ...baseVars,
          routeName: utils.toPascalCase(name),
          description: options.description || `${utils.toPascalCase(name)} API route`
        };

      case 'hook':
        const hookName = name.startsWith('use') ? name : `use${utils.toPascalCase(name)}`;
        return {
          ...baseVars,
          hookName: hookName,
          description: options.description || `${hookName} custom hook`
        };

      default:
        return baseVars;
    }
  }

  /**
   * 列出可用的模板
   */
  listTemplates() {
    console.log('📋 Available templates:');
    Object.keys(templates).forEach(type => {
      const config = templates[type];
      console.log(`\n  ${type}:`);
      console.log(`    Output: ${config.outputDir}`);
      console.log(`    Files: ${config.files.map(f => f.name).join(', ')}`);
    });
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
📖 Code Generator Help

Usage:
  node scripts/generate.js <type> <name> [options]

Types:
  component    Generate React component
  api-route    Generate Next.js API route
  hook         Generate React hook

Options:
  --description <desc>  Set description
  --force              Overwrite existing files
  --help               Show this help

Examples:
  node scripts/generate.js component UserCard
  node scripts/generate.js api-route users --description "User management API"
  node scripts/generate.js hook useLocalStorage --force

Available templates:
`);
    this.listTemplates();
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    const generator = new Generator();
    generator.showHelp();
    return;
  }

  if (args[0] === 'list') {
    const generator = new Generator();
    generator.listTemplates();
    return;
  }

  const [type, name, ...optionArgs] = args;

  if (!type || !name) {
    console.error('❌ Error: Type and name are required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  // 解析选项
  const options = {};
  for (let i = 0; i < optionArgs.length; i++) {
    const arg = optionArgs[i];
    if (arg === '--description' && i + 1 < optionArgs.length) {
      options.description = optionArgs[i + 1];
      i++; // 跳过下一个参数
    } else if (arg === '--force') {
      options.force = true;
    }
  }

  try {
    const generator = new Generator();
    await generator.generate(type, name, options);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { Generator, utils };