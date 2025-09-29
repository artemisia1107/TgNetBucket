/**
 * 文件选择 Hook
 * 提供文件选择的状态和业务逻辑，支持过滤后的文件列表
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FileSelectionManager } from '../utils/FileSelectionManager';

/**
 * 文件选择 Hook
 * @param {Array} allFiles - 所有文件列表
 * @param {Array} filteredFiles - 过滤后的文件列表
 * @param {Object} options - 配置选项
 * @returns {Object} 文件选择状态和方法
 */
export function useFileSelection(allFiles = [], filteredFiles = [], options = {}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lastSelectedFile, setLastSelectedFile] = useState(null);
  const managerRef = useRef(null);

  // 初始化FileSelectionManager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new FileSelectionManager(allFiles, filteredFiles);
      
      // 添加状态变化监听器
      const handleStateChange = (state) => {
        setSelectedFiles(state.selectedFiles);
      };
      
      managerRef.current.addListener(handleStateChange);
      
      return () => {
        if (managerRef.current) {
          managerRef.current.removeListener(handleStateChange);
          if (options.autoDestroy !== false) {
            managerRef.current.destroy();
          }
        }
      };
    }
  }, []);

  // 更新文件列表
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateFiles(allFiles, filteredFiles);
    }
  }, [allFiles, filteredFiles]);

  /**
   * 切换单个文件的选择状态
   * @param {string} fileId - 文件ID
   * @param {Object} event - 事件对象（支持Ctrl/Shift键）
   */
  const toggleSelection = useCallback((fileId, event = {}) => {
    if (!managerRef.current) return;

    const { ctrlKey, shiftKey } = event;
    
    if (shiftKey && lastSelectedFile) {
      // Shift+点击：选择范围
      managerRef.current.selectRange(lastSelectedFile, fileId);
    } else if (ctrlKey) {
      // Ctrl+点击：切换选择状态
      managerRef.current.toggleSelection(fileId);
    } else {
      // 普通点击：切换选择状态
      managerRef.current.toggleSelection(fileId);
    }
    
    setLastSelectedFile(fileId);
  }, [lastSelectedFile]);

  /**
   * 全选/取消全选
   * 基于当前过滤后的文件列表进行全选操作
   */
  const selectAll = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.selectAll();
    }
  }, []);

  /**
   * 清空选择
   */
  const clearSelection = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.clearSelection();
    }
  }, []);

  /**
   * 反选
   */
  const invertSelection = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.invertSelection();
    }
  }, []);

  /**
   * 根据条件选择文件
   * @param {Function} predicate - 筛选条件函数
   */
  const selectByCondition = useCallback((predicate) => {
    if (managerRef.current) {
      managerRef.current.selectByCondition(predicate);
    }
  }, []);

  /**
   * 选择文件
   * @param {string} fileId - 文件ID
   */
  const selectFile = useCallback((fileId) => {
    if (managerRef.current) {
      managerRef.current.selectFile(fileId);
      setLastSelectedFile(fileId);
    }
  }, []);

  /**
   * 取消选择文件
   * @param {string} fileId - 文件ID
   */
  const deselectFile = useCallback((fileId) => {
    if (managerRef.current) {
      managerRef.current.deselectFile(fileId);
    }
  }, []);

  /**
   * 计算选择状态
   */
  const selectionState = useMemo(() => {
    if (!managerRef.current) {
      return {
        selectedFiles: [],
        selectedCount: 0,
        isAllSelected: false,
        isPartiallySelected: false,
        selectedTotalSize: 0,
        selectedFileObjects: []
      };
    }
    
    return managerRef.current.getSelectionState();
  }, [selectedFiles, filteredFiles, allFiles]);

  /**
   * 获取选择统计信息
   */
  const selectionStats = useMemo(() => {
    if (!managerRef.current) {
      return {
        totalCount: 0,
        totalSize: 0,
        typeStats: {},
        sizeStats: { small: 0, medium: 0, large: 0 }
      };
    }
    
    return managerRef.current.getSelectionStats();
  }, [selectedFiles]);

  /**
   * 检查文件是否被选中
   * @param {string} fileId - 文件ID
   */
  const isSelected = useCallback((fileId) => {
    return managerRef.current ? managerRef.current.isSelected(fileId) : false;
  }, [selectedFiles]);

  /**
   * 导出选择状态
   */
  const exportState = useCallback(() => {
    return managerRef.current ? managerRef.current.exportState() : null;
  }, []);

  /**
   * 导入选择状态
   * @param {Object} state - 导出的状态
   */
  const importState = useCallback((state) => {
    if (managerRef.current) {
      managerRef.current.importState(state);
    }
  }, []);

  return {
    // 基本状态
    ...selectionState,
    selectionStats,
    lastSelectedFile,
    
    // 基本操作
    toggleSelection,
    selectAll,
    clearSelection,
    selectFile,
    deselectFile,
    
    // 高级操作
    invertSelection,
    selectByCondition,
    
    // 工具方法
    isSelected,
    exportState,
    importState,
    
    // 管理器实例（用于高级用法）
    manager: managerRef.current
  };
}