/**
 * 文件预览功能模块
 * 提供文件预览、缩略图生成等功能
 */

import { getFileIcon, formatFileSize } from '../../../utils/fileUtils.js';
import { generateId } from '../../../utils/commonUtils.js';
import { FILE_CONFIG } from '../../../constants/config.js';

/**
 * 文件预览管理器类
 */
class FilePreviewManager {
  constructor(options = {}) {
    this.options = {
      maxPreviewSize: 10 * 1024 * 1024, // 10MB
      supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      supportedVideoTypes: ['video/mp4', 'video/webm'],
      thumbnailSize: { width: 150, height: 150 },
      onPreviewGenerated: null,
      onError: null,
      ...options
    };
    
    this.previewCache = new Map();
  }

  /**
   * 生成文件预览
   * @param {File} file - 文件对象
   * @returns {Promise<Object>} 预览对象
   */
  async generateFilePreview(file) {
    const previewId = generateId('preview');
    const fileType = this.getFileType(file.name);
    
    const preview = {
      id: previewId,
      file,
      name: file.name,
      size: file.size,
      type: fileType,
      mimeType: file.type,
      lastModified: file.lastModified,
      preview: null,
      thumbnail: null,
      status: 'pending',
      error: null
    };

    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(file);
      if (this.previewCache.has(cacheKey)) {
        const cachedPreview = this.previewCache.get(cacheKey);
        preview.preview = cachedPreview.preview;
        preview.thumbnail = cachedPreview.thumbnail;
        preview.status = 'completed';
        return preview;
      }

      // 根据文件类型生成预览
      if (this.isImageFile(file)) {
        await this.generateImagePreview(preview);
      } else if (this.isVideoFile(file)) {
        await this.generateVideoPreview(preview);
      } else if (this.isAudioFile(file)) {
        await this.generateAudioPreview(preview);
      } else if (this.isTextFile(file)) {
        await this.generateTextPreview(preview);
      } else {
        // 其他文件类型使用图标
        preview.preview = this.getFileIconUrl(fileType);
        preview.status = 'completed';
      }

      // 缓存预览结果
      if (preview.preview) {
        this.previewCache.set(cacheKey, {
          preview: preview.preview,
          thumbnail: preview.thumbnail
        });
      }

      if (this.options.onPreviewGenerated) {
        this.options.onPreviewGenerated(preview);
      }

    } catch (error) {
      preview.status = 'error';
      preview.error = error.message;
      
      if (this.options.onError) {
        this.options.onError(preview, error);
      }
    }

    return preview;
  }

  /**
   * 生成图片预览
   * @param {Object} preview - 预览对象
   */
  async generateImagePreview(preview) {
    const { file } = preview;
    
    if (file.size > this.options.maxPreviewSize) {
      preview.preview = this.getFileIconUrl('image');
      preview.status = 'completed';
      return;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target.result;
          preview.preview = dataUrl;
          
          // 生成缩略图
          preview.thumbnail = await this.generateThumbnail(dataUrl, 'image');
          preview.status = 'completed';
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取图片文件失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * 生成视频预览
   * @param {Object} preview - 预览对象
   */
  async generateVideoPreview(preview) {
    const { file } = preview;
    
    if (file.size > this.options.maxPreviewSize) {
      preview.preview = this.getFileIconUrl('video');
      preview.status = 'completed';
      return;
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // 设置画布尺寸
        canvas.width = this.options.thumbnailSize.width;
        canvas.height = this.options.thumbnailSize.height;
        
        // 计算视频在画布中的位置和尺寸
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (videoAspect > canvasAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / videoAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * videoAspect;
          drawHeight = canvas.height;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        // 跳转到视频中间位置
        video.currentTime = video.duration / 2;
      };
      
      video.onseeked = () => {
        try {
          // 绘制视频帧到画布
          ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
          
          // 获取缩略图
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          preview.preview = thumbnailDataUrl;
          preview.thumbnail = thumbnailDataUrl;
          preview.status = 'completed';
          
          // 清理资源
          URL.revokeObjectURL(video.src);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => {
        reject(new Error('读取视频文件失败'));
      };
      
      // 创建视频URL
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      video.load();
    });
  }

  /**
   * 生成音频预览
   * @param {Object} preview - 预览对象
   */
  async generateAudioPreview(preview) {
    // 音频文件使用音频图标
    preview.preview = this.getFileIconUrl('audio');
    preview.status = 'completed';
    
    // 可以在这里添加音频波形图生成逻辑
    return Promise.resolve();
  }

  /**
   * 生成文本预览
   * @param {Object} preview - 预览对象
   */
  async generateTextPreview(preview) {
    const { file } = preview;
    
    if (file.size > 1024 * 1024) { // 1MB限制
      preview.preview = this.getFileIconUrl('document');
      preview.status = 'completed';
      return;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const truncatedText = text.substring(0, 500); // 只显示前500个字符
          
          // 创建文本预览
          preview.preview = this.createTextPreviewImage(truncatedText);
          preview.status = 'completed';
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文本文件失败'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 创建文本预览图片
   * @param {string} text - 文本内容
   * @returns {string} 预览图片的Data URL
   */
  createTextPreviewImage(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = this.options.thumbnailSize.width;
    canvas.height = this.options.thumbnailSize.height;
    
    // 设置背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 设置文本样式
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 绘制文本
    const lines = this.wrapText(ctx, text, canvas.width - 20);
    const lineHeight = 16;
    
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
      ctx.fillText(lines[i], 10, 10 + i * lineHeight);
    }
    
    // 如果文本被截断，添加省略号
    if (lines.length > 8) {
      ctx.fillText('...', 10, 10 + 8 * lineHeight);
    }
    
    return canvas.toDataURL('image/png');
  }

  /**
   * 文本换行处理
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {string} text - 文本内容
   * @param {number} maxWidth - 最大宽度
   * @returns {Array} 行数组
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * 生成缩略图
   * @param {string} dataUrl - 原始图片的Data URL
   * @param {string} type - 文件类型
   * @returns {Promise<string>} 缩略图的Data URL
   */
  async generateThumbnail(dataUrl, type) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = this.options.thumbnailSize.width;
          canvas.height = this.options.thumbnailSize.height;
          
          // 计算缩放比例和位置
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > canvasAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * imgAspect;
            drawHeight = canvas.height;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }
          
          // 绘制图片
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('生成缩略图失败'));
      };
      
      img.src = dataUrl;
    });
  }

  /**
   * 检查是否为图片文件
   * @param {File} file - 文件对象
   * @returns {boolean} 是否为图片文件
   */
  isImageFile(file) {
    return this.options.supportedImageTypes.includes(file.type);
  }

  /**
   * 检查是否为视频文件
   * @param {File} file - 文件对象
   * @returns {boolean} 是否为视频文件
   */
  isVideoFile(file) {
    return this.options.supportedVideoTypes.includes(file.type);
  }

  /**
   * 检查是否为音频文件
   * @param {File} file - 文件对象
   * @returns {boolean} 是否为音频文件
   */
  isAudioFile(file) {
    return file.type.startsWith('audio/');
  }

  /**
   * 检查是否为文本文件
   * @param {File} file - 文件对象
   * @returns {boolean} 是否为文本文件
   */
  isTextFile(file) {
    return file.type.startsWith('text/') || 
           ['application/json', 'application/xml'].includes(file.type);
  }

  /**
   * 获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型
   */
  getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      return 'document';
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return 'archive';
    } else {
      return 'other';
    }
  }

  /**
   * 获取文件图标URL
   * @param {string} fileType - 文件类型
   * @returns {string} 图标URL或emoji
   */
  getFileIconUrl(fileType) {
    const iconMap = FILE_CONFIG.ICON_MAP;
    return iconMap[fileType] || iconMap.default;
  }

  /**
   * 获取缓存键
   * @param {File} file - 文件对象
   * @returns {string} 缓存键
   */
  getCacheKey(file) {
    return `${file.name}_${file.size}_${file.lastModified}`;
  }

  /**
   * 清空预览缓存
   */
  clearCache() {
    this.previewCache.clear();
  }

  /**
   * 获取缓存大小
   * @returns {number} 缓存项数量
   */
  getCacheSize() {
    return this.previewCache.size;
  }

  /**
   * 批量生成预览
   * @param {FileList|Array} files - 文件列表
   * @returns {Promise<Array>} 预览对象数组
   */
  async generateBatchPreviews(files) {
    const fileArray = Array.from(files);
    const previewPromises = fileArray.map(file => this.generateFilePreview(file));
    
    try {
      const previews = await Promise.all(previewPromises);
      return previews;
    } catch (error) {
      console.error('批量生成预览失败:', error);
      throw error;
    }
  }
}

/**
 * 创建文件预览管理器实例
 * @param {Object} options - 配置选项
 * @returns {FilePreviewManager} 预览管理器实例
 */
function createFilePreview(options = {}) {
  return new FilePreviewManager(options);
}

/**
 * 快速生成单个文件预览
 * @param {File} file - 文件对象
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 预览对象
 */
async function generateFilePreview(file, options = {}) {
  const previewManager = createFilePreview(options);
  return await previewManager.generateFilePreview(file);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FilePreviewManager,
    createFilePreview,
    generateFilePreview
  };
} else if (typeof window !== 'undefined') {
  window.FilePreview = {
    FilePreviewManager,
    createFilePreview,
    generateFilePreview
  };
}