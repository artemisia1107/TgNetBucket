/**
 * UI常量配置
 * 定义界面相关的常量、样式、动画和交互配置
 */

/**
 * 颜色主题配置
 */
export const COLORS = {
  // 主色调
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },
  
  // 辅助色
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // 状态色
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  INFO: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  }
};

/**
 * 断点配置
 */
export const BREAKPOINTS = {
  XS: '480px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

/**
 * Z-index层级
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090
};

/**
 * 动画配置
 */
export const ANIMATIONS = {
  // 持续时间
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
    SLOWER: '750ms'
  },
  
  // 缓动函数
  EASING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // 预设动画
  PRESETS: {
    FADE_IN: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: '300ms',
      easing: 'ease-out'
    },
    FADE_OUT: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: '300ms',
      easing: 'ease-in'
    },
    SLIDE_UP: {
      from: { transform: 'translateY(100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: '300ms',
      easing: 'ease-out'
    },
    SLIDE_DOWN: {
      from: { transform: 'translateY(-100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: '300ms',
      easing: 'ease-out'
    },
    SCALE_IN: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
      duration: '200ms',
      easing: 'ease-out'
    },
    BOUNCE_IN: {
      from: { transform: 'scale(0.3)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
      duration: '500ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
};

/**
 * 间距配置
 */
export const SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem'     // 256px
};

/**
 * 字体配置
 */
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    SANS: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    SERIF: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    MONO: ['Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
  },
  
  FONT_SIZE: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
    '5XL': '3rem',    // 48px
    '6XL': '3.75rem', // 60px
    '7XL': '4.5rem',  // 72px
    '8XL': '6rem',    // 96px
    '9XL': '8rem'     // 128px
  },
  
  FONT_WEIGHT: {
    THIN: '100',
    EXTRALIGHT: '200',
    LIGHT: '300',
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
    BLACK: '900'
  },
  
  LINE_HEIGHT: {
    NONE: '1',
    TIGHT: '1.25',
    SNUG: '1.375',
    NORMAL: '1.5',
    RELAXED: '1.625',
    LOOSE: '2'
  }
};

/**
 * 阴影配置
 */
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2XL': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

/**
 * 圆角配置
 */
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  MD: '0.375rem',   // 6px
  LG: '0.5rem',     // 8px
  XL: '0.75rem',    // 12px
  '2XL': '1rem',    // 16px
  '3XL': '1.5rem',  // 24px
  FULL: '9999px'
};

/**
 * 消息提示配置
 */
export const MESSAGE = {
  DURATION: {
    SHORT: 2000,
    NORMAL: 4000,
    LONG: 6000,
    PERSISTENT: 0
  },
  
  POSITION: {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right'
  },
  
  TYPE: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    LOADING: 'loading'
  }
};

/**
 * 模态框配置
 */
export const MODAL = {
  SIZE: {
    XS: '320px',
    SM: '384px',
    MD: '448px',
    LG: '512px',
    XL: '576px',
    '2XL': '672px',
    '3XL': '768px',
    '4XL': '896px',
    '5XL': '1024px',
    '6XL': '1152px',
    FULL: '100vw'
  },
  
  BACKDROP: {
    BLUR: 'blur(4px)',
    OPACITY: 0.5
  }
};

/**
 * 表格配置
 */
export const TABLE = {
  ROW_HEIGHT: {
    COMPACT: '32px',
    NORMAL: '48px',
    COMFORTABLE: '64px'
  },
  
  CELL_PADDING: {
    COMPACT: '8px',
    NORMAL: '12px',
    COMFORTABLE: '16px'
  }
};

/**
 * 按钮配置
 */
export const BUTTON = {
  SIZE: {
    XS: {
      height: '24px',
      padding: '0 8px',
      fontSize: '12px'
    },
    SM: {
      height: '32px',
      padding: '0 12px',
      fontSize: '14px'
    },
    MD: {
      height: '40px',
      padding: '0 16px',
      fontSize: '16px'
    },
    LG: {
      height: '48px',
      padding: '0 20px',
      fontSize: '18px'
    },
    XL: {
      height: '56px',
      padding: '0 24px',
      fontSize: '20px'
    }
  },
  
  VARIANT: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info',
    GHOST: 'ghost',
    LINK: 'link'
  }
};

/**
 * 输入框配置
 */
export const INPUT = {
  SIZE: {
    SM: {
      height: '32px',
      padding: '0 8px',
      fontSize: '14px'
    },
    MD: {
      height: '40px',
      padding: '0 12px',
      fontSize: '16px'
    },
    LG: {
      height: '48px',
      padding: '0 16px',
      fontSize: '18px'
    }
  },
  
  STATE: {
    DEFAULT: 'default',
    FOCUS: 'focus',
    ERROR: 'error',
    SUCCESS: 'success',
    DISABLED: 'disabled'
  }
};

/**
 * 加载状态配置
 */
export const LOADING = {
  SPINNER: {
    SIZE: {
      XS: '16px',
      SM: '20px',
      MD: '24px',
      LG: '32px',
      XL: '40px'
    },
    
    SPEED: {
      SLOW: '2s',
      NORMAL: '1s',
      FAST: '0.5s'
    }
  },
  
  SKELETON: {
    ANIMATION_DURATION: '1.5s',
    SHIMMER_COLOR: 'rgba(255, 255, 255, 0.2)'
  }
};

/**
 * 文件上传配置
 */
export const UPLOAD = {
  DROPZONE: {
    BORDER_COLOR: {
      DEFAULT: COLORS.SECONDARY[300],
      HOVER: COLORS.PRIMARY[400],
      ACTIVE: COLORS.PRIMARY[500],
      ERROR: COLORS.ERROR[400]
    },
    
    BACKGROUND_COLOR: {
      DEFAULT: COLORS.SECONDARY[50],
      HOVER: COLORS.PRIMARY[50],
      ACTIVE: COLORS.PRIMARY[100],
      ERROR: COLORS.ERROR[50]
    }
  },
  
  PROGRESS: {
    HEIGHT: '8px',
    BACKGROUND_COLOR: COLORS.SECONDARY[200],
    FILL_COLOR: COLORS.PRIMARY[500],
    BORDER_RADIUS: BORDER_RADIUS.FULL
  }
};

/**
 * 视图模式配置
 */
export const VIEW_MODE = {
  GRID: 'grid',
  LIST: 'list',
  CARD: 'card'
};

/**
 * 排序配置
 */
export const SORT = {
  ORDER: {
    ASC: 'asc',
    DESC: 'desc'
  },
  
  FIELD: {
    NAME: 'name',
    SIZE: 'size',
    DATE: 'date',
    TYPE: 'type'
  }
};

export default {
  COLORS,
  BREAKPOINTS,
  Z_INDEX,
  ANIMATIONS,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  BORDER_RADIUS,
  MESSAGE,
  MODAL,
  TABLE,
  BUTTON,
  INPUT,
  LOADING,
  UPLOAD,
  VIEW_MODE,
  SORT
};