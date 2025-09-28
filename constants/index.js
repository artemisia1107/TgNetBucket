/**
 * 常量配置统一导出
 */

// 导入所有配置模块
import config from './config.js';
import apiEndpoints from './apiEndpoints.js';
import fileTypes from './fileTypes.js';
import uiConstants from './uiConstants.js';

// 统一导出
export { 
  config, 
  apiEndpoints, 
  fileTypes, 
  uiConstants 
};

// 默认导出
export default {
  config,
  apiEndpoints,
  fileTypes,
  uiConstants
};

// 兼容性导出（支持CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    config,
    apiEndpoints,
    fileTypes,
    uiConstants
  };
}