/**
 * React 组件模板
 * 用于生成标准化的 React 组件
 */

const componentTemplate = `import React, { useState, useEffect, ReactNode } from 'react';
import styles from './{{componentName}}.module.css';

/**
 * {{componentName}} 组件的属性接口
 */
interface {{componentName}}Props {
  /** 自定义 CSS 类名 */
  className?: string;
  /** 子元素 */
  children?: ReactNode;
  /** 是否禁用组件 */
  disabled?: boolean;
  /** 点击事件处理函数 */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** 其他 HTML 属性 */
  [key: string]: any;
}

/**
 * {{componentName}} 组件
 * {{description}}
 * 
 * @author {{author}}
 * @since {{date}}
 */
const {{componentName}}: React.FC<{{componentName}}Props> = ({
  className = '',
  children,
  disabled = false,
  onClick,
  ...props
}) => {
  // 状态管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 副作用处理
  useEffect(() => {
    // 组件挂载时的逻辑
    return () => {
      // 清理逻辑
    };
  }, []);

  // 事件处理函数
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (disabled) return;
    
    // 处理点击事件
    onClick?.(event);
  };

  const handleError = (error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    console.error('{{componentName}} Error:', errorMessage);
    setError(errorMessage);
  };

  // 渲染条件判断
  if (error) {
    return (
      <div className={\`\${styles.error} \${className}\`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={\`\${styles.loading} \${className}\`}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className={\`\${styles.container} \${className}\`}
      {...props}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{{componentName}}</h2>
      </div>
      
      <div className={styles.content}>
        {children}
      </div>
      
      <div className={styles.actions}>
        <button 
          className={styles.button}
          onClick={handleClick}
          disabled={isLoading}
        >
          Action
        </button>
      </div>
    </div>
  );
};

// TypeScript 接口已经提供了类型检查，无需 PropTypes

export default {{componentName}};
`;

const styleTemplate = `/* {{componentName}} 组件样式 */

.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.container:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.content {
  flex: 1;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button:hover:not(:disabled) {
  background-color: #0056b3;
}

.button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666666;
}

.error {
  padding: 1rem;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0.75rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .button {
    flex: 1;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .container {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .title {
    color: #f7fafc;
  }
  
  .header {
    border-bottom-color: #4a5568;
  }
  
  .error {
    background-color: #fed7d7;
    border-color: #e53e3e;
    color: #742a2a;
  }
}
`;

const testTemplate = `import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import {{componentName}} from './{{componentName}}';

/**
 * {{componentName}} 组件测试
 * 
 * @author {{author}}
 * @since {{date}}
 */
describe('{{componentName}}', () => {
  // 基础渲染测试
  test('renders without crashing', () => {
    render(<{{componentName}} />);
    expect(screen.getByText('{{componentName}}')).toBeInTheDocument();
  });

  // 属性传递测试
  test('accepts custom className', () => {
    const customClass = 'custom-class';
    render(<{{componentName}} className={customClass} />);
    const container = screen.getByText('{{componentName}}').closest('div');
    expect(container).toHaveClass(customClass);
  });

  // 子组件渲染测试
  test('renders children correctly', () => {
    const childText = 'Test child content';
    render(
      <{{componentName}}>
        <span>{childText}</span>
      </{{componentName}}>
    );
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  // 事件处理测试
  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<{{componentName}} onClick={handleClick} />);
    
    const button = screen.getByText('Action');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 禁用状态测试
  test('disables button when disabled prop is true', () => {
    render(<{{componentName}} disabled />);
    const button = screen.getByText('Action');
    expect(button).toBeDisabled();
  });

  // 错误状态测试
  test('displays error message when error occurs', () => {
    const errorMessage = 'Test error message';
    // 这里需要根据实际的错误处理逻辑来编写测试
    // 例如通过 props 传递错误状态或模拟错误情况
  });

  // 加载状态测试
  test('displays loading state', () => {
    // 这里需要根据实际的加载状态逻辑来编写测试
    // 例如通过 props 传递加载状态或模拟异步操作
  });

  // 快照测试
  test('matches snapshot', () => {
    const { container } = render(<{{componentName}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
`;

const storyTemplate = `import React from 'react';
import {{componentName}} from './{{componentName}}';

/**
 * {{componentName}} Storybook 故事
 * 
 * @author {{author}}
 * @since {{date}}
 */
export default {
  title: 'Components/{{componentName}}',
  component: {{componentName}},
  parameters: {
    docs: {
      description: {
        component: '{{description}}'
      }
    }
  },
  argTypes: {
    className: {
      control: 'text',
      description: '自定义 CSS 类名'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用组件'
    },
    onClick: {
      action: 'clicked',
      description: '点击事件处理函数'
    }
  }
};

// 默认故事
export const Default = {
  args: {
    children: 'Default content'
  }
};

// 禁用状态故事
export const Disabled = {
  args: {
    disabled: true,
    children: 'Disabled content'
  }
};

// 自定义样式故事
export const CustomStyle = {
  args: {
    className: 'custom-style',
    children: 'Custom styled content'
  }
};

// 交互式故事
export const Interactive = {
  args: {
    children: 'Interactive content'
  },
  play: async ({ canvasElement }) => {
    // 这里可以添加交互式测试逻辑
  }
};

// 长内容故事
export const LongContent = {
  args: {
    children: (
      <div>
        <p>This is a long content example to test how the component handles overflow and layout.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
    )
  }
};
`;

module.exports = {
  componentTemplate,
  styleTemplate,
  testTemplate,
  storyTemplate
};