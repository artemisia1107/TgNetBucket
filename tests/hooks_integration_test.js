/**
 * Hooks集成测试
 * 验证各个hooks的集成功能是否正常工作
 */

const { describe, it } = require('mocha');
const assert = require('assert');

describe('Hooks集成测试', () => {
  describe('useDebounce集成', () => {
    it('应该在useFileList中正确集成防抖功能', () => {
      // 这里我们验证useDebounce已经被正确导入到useFileList中
      const useFileListContent = require('fs').readFileSync(
        require('path').join(__dirname, '../hooks/useFileList.js'), 
        'utf8'
      );
      
      assert(
        useFileListContent.includes("import { useDebounce } from './useDebounce'"),
        'useFileList应该导入useDebounce'
      );
      
      assert(
        useFileListContent.includes('useDebounce(searchTerm, 300)'),
        'useFileList应该使用防抖搜索'
      );
      
      assert(
        useFileListContent.includes('debouncedSearchTerm'),
        'useFileList应该使用防抖后的搜索词'
      );
    });
  });

  describe('useApi集成', () => {
    it('应该在FileUpload组件中正确集成useApi', () => {
      const fileUploadContent = require('fs').readFileSync(
        require('path').join(__dirname, '../components/features/FileUpload/FileUpload.js'), 
        'utf8'
      );
      
      assert(
        fileUploadContent.includes("import { useApi } from '../../../hooks/useApi'"),
        'FileUpload应该导入useApi'
      );
      
      assert(
        fileUploadContent.includes('const { execute: uploadFile'),
        'FileUpload应该使用useApi的execute方法'
      );
      
      assert(
        fileUploadContent.includes('await uploadFile(\'/api/files\''),
        'FileUpload应该使用useApi进行文件上传'
      );
    });

    it('应该在FilePreview组件中正确集成useApi', () => {
      const filePreviewContent = require('fs').readFileSync(
        require('path').join(__dirname, '../components/features/FilePreview/FilePreview.js'), 
        'utf8'
      );
      
      assert(
        filePreviewContent.includes("import { useApi } from '../../../hooks/useApi'"),
        'FilePreview应该导入useApi'
      );
      
      assert(
        filePreviewContent.includes('const { get: getFileContent } = useApi()'),
        'FilePreview应该使用useApi的get方法'
      );
      
      assert(
        filePreviewContent.includes('await getFileContent(`/api/files/${file.id}/content`'),
        'FilePreview应该使用useApi获取文件内容'
      );
    });
  });

  describe('useAdminPanel集成', () => {
    it('应该在admin页面中正确集成useAdminPanel', () => {
      const adminContent = require('fs').readFileSync(
        require('path').join(__dirname, '../pages/admin.js'), 
        'utf8'
      );
      
      assert(
        adminContent.includes("import { useAdminPanel } from '../hooks/useAdminPanel'"),
        'admin页面应该导入useAdminPanel'
      );
      
      assert(
        adminContent.includes('const {'),
        'admin页面应该解构useAdminPanel的返回值'
      );
      
      assert(
        adminContent.includes('activeTab'),
        'admin页面应该使用useAdminPanel的activeTab状态'
      );
      
      assert(
        adminContent.includes('systemStats'),
        'admin页面应该使用useAdminPanel的systemStats状态'
      );
    });
  });

  describe('hooks导出验证', () => {
    it('应该正确导出所有hooks', () => {
      const hooksIndexContent = require('fs').readFileSync(
        require('path').join(__dirname, '../hooks/index.js'), 
        'utf8'
      );
      
      const expectedHooks = [
        'useFileUpload',
        'useFileManager', 
        'useAdminPanel',
        'useApi',
        'useLocalStorage',
        'useDebounce'
      ];
      
      expectedHooks.forEach(hook => {
        assert(
          hooksIndexContent.includes(hook),
          `hooks/index.js应该导出${hook}`
        );
      });
    });
  });
});