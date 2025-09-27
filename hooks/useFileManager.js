/**
 * 文件管理 Hook
 * 提供文件列表管理的状态和业务逻辑
 */
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { createSuccessMessage, createErrorMessage } from '../components/ui/Message';
import { createConfirmDialog } from '../components/ui/Modal';

/**
 * 文件管理 Hook
 * @returns {Object} 文件管理状态和方法
 */
export function useFileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadTime');
  const [sortOrder, setSortOrder] = useState('desc');

  /**
   * 获取文件列表
   * @returns {Promise<void>}
   */
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/files');
      if (response.data.success) {
        setFiles(response.data.data || []);
      } else {
        throw new Error(response.data.error || '获取文件列表失败');
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      createErrorMessage('获取文件列表失败');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 删除单个文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  const deleteFile = useCallback(async (fileId) => {
    const confirmed = await createConfirmDialog('确定要删除这个文件吗？');
    if (!confirmed) return false;

    try {
      const response = await axios.delete(`/api/files?id=${fileId}`);
      if (response.data.success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        setSelectedFiles(prev => prev.filter(id => id !== fileId));
        createSuccessMessage('文件删除成功');
        return true;
      } else {
        throw new Error(response.data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      createErrorMessage(`删除文件失败: ${error.message}`);
      return false;
    }
  }, []);

  /**
   * 批量删除文件
   * @param {Array<string>} fileIds - 文件ID数组
   * @returns {Promise<boolean>} 是否删除成功
   */
  const deleteMultipleFiles = useCallback(async (fileIds = selectedFiles) => {
    if (fileIds.length === 0) {
      createErrorMessage('请选择要删除的文件');
      return false;
    }

    const confirmed = await createConfirmDialog(`确定要删除选中的 ${fileIds.length} 个文件吗？`);
    if (!confirmed) return false;

    try {
      const deletePromises = fileIds.map(fileId => 
        axios.delete(`/api/files?id=${fileId}`)
      );
      
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.data.success
      ).length;

      if (successCount > 0) {
        setFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
        setSelectedFiles([]);
        createSuccessMessage(`成功删除 ${successCount} 个文件`);
      }

      if (successCount < fileIds.length) {
        createErrorMessage(`${fileIds.length - successCount} 个文件删除失败`);
      }

      return successCount === fileIds.length;
    } catch (error) {
      console.error('批量删除文件失败:', error);
      createErrorMessage('批量删除文件失败');
      return false;
    }
  }, [selectedFiles]);

  /**
   * 生成短链接
   * @param {string} fileId - 文件ID
   * @returns {Promise<string|null>} 短链接URL
   */
  const generateShortLink = useCallback(async (fileId) => {
    try {
      const response = await axios.post('/api/short-link', { fileId });
      if (response.data.success) {
        const shortUrl = `${window.location.origin}/s/${response.data.data.shortCode}`;
        createSuccessMessage(`短链接已生成: ${shortUrl}`);
        return shortUrl;
      } else {
        throw new Error(response.data.error || '生成短链接失败');
      }
    } catch (error) {
      console.error('生成短链接失败:', error);
      createErrorMessage(`生成短链接失败: ${error.message}`);
      return null;
    }
  }, []);

  /**
   * 选择/取消选择文件
   * @param {string} fileId - 文件ID
   */
  const toggleFileSelection = useCallback((fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  }, []);

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  }, [selectedFiles.length, files]);

  /**
   * 过滤和排序文件
   */
  const filteredAndSortedFiles = useCallback(() => {
    let result = [...files];

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'uploadTime') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'size') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [files, searchTerm, sortBy, sortOrder]);

  // 初始化时获取文件列表
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    // 状态
    files: filteredAndSortedFiles(),
    loading,
    selectedFiles,
    searchTerm,
    sortBy,
    sortOrder,
    
    // 方法
    fetchFiles,
    deleteFile,
    deleteMultipleFiles,
    generateShortLink,
    toggleFileSelection,
    toggleSelectAll,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    
    // 计算属性
    hasSelectedFiles: selectedFiles.length > 0,
    isAllSelected: selectedFiles.length === files.length && files.length > 0,
  };
}