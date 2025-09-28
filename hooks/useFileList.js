import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

/**
 * 文件列表管理钩子
 * 提供文件列表的获取、搜索、排序和过滤功能
 * @returns {Object} 文件列表相关的状态和方法
 */
export const useFileList = () => {
  // 基础状态
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadTime');
  const [sortOrder, setSortOrder] = useState('desc');

  /**
   * 获取文件列表
   */
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/files');
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('获取文件列表失败:', error);
      setError('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 根据文件名获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型
   */
  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    return 'other';
  };

  /**
   * 过滤和排序后的文件列表
   */
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(file => getFileType(file.fileName) === filterType);
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'fileSize':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        case 'uploadTime':
        default:
          aValue = new Date(a.uploadTime || 0);
          bValue = new Date(b.uploadTime || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [files, searchTerm, filterType, sortBy, sortOrder]);

  /**
   * 删除文件
   * @param {string} messageId - 消息ID
   */
  const deleteFile = async (messageId) => {
    try {
      await axios.delete(`/api/files?messageId=${messageId}`);
      await fetchFiles(); // 重新获取文件列表
      return { success: true };
    } catch (error) {
      console.error('删除失败:', error);
      return { success: false, error: '删除失败' };
    }
  };

  /**
   * 生成短链接
   * @param {string} fileId - 文件ID
   */
  const generateShortLink = async (fileId) => {
    try {
      const response = await axios.post('/api/shortlink', { fileId });
      return { success: true, shortLink: response.data.shortLink };
    } catch (error) {
      console.error('生成短链接失败:', error);
      return { success: false, error: '生成短链接失败' };
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    // 状态
    files: filteredAndSortedFiles,
    loading,
    error,
    searchTerm,
    filterType,
    sortBy,
    sortOrder,
    
    // 方法
    fetchFiles,
    deleteFile,
    generateShortLink,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setSortOrder,
    getFileType
  };
};

export default useFileList;