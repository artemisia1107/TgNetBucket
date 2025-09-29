/**
 * 常量配置统一导出
 * 提供所有常量配置的统一入口
 */

// 导入所有配置模块
import config from './config';
import apiEndpoints from './apiEndpoints';
import fileTypes from './fileTypes';
import uiConstants from './uiConstants';

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