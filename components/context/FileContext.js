/**
 * 文件管理全局状态 Context
 * 提供文件列表、上传状态、选择状态等全局管理
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useFileManager, useFileUpload } from '../../hooks';

// 创建 Context
const FileContext = createContext();

// 初始状态
const initialState = {
  files: [],
  filteredFiles: [],
  selectedFiles: new Set(),
  uploadQueue: [],
  searchTerm: '',
  sortBy: 'uploadTime',
  sortOrder: 'desc',
  viewMode: 'grid', // 'grid' | 'list'
  isLoading: false,
  error: null,
  uploadProgress: {},
  totalFiles: 0,
  totalSize: 0
};

// Action 类型
const ActionTypes = {
  SET_FILES: 'SET_FILES',
  SET_FILTERED_FILES: 'SET_FILTERED_FILES',
  ADD_FILE: 'ADD_FILE',
  REMOVE_FILE: 'REMOVE_FILE',
  UPDATE_FILE: 'UPDATE_FILE',
  SET_SELECTED_FILES: 'SET_SELECTED_FILES',
  ADD_SELECTED_FILE: 'ADD_SELECTED_FILE',
  REMOVE_SELECTED_FILE: 'REMOVE_SELECTED_FILE',
  CLEAR_SELECTED_FILES: 'CLEAR_SELECTED_FILES',
  SET_UPLOAD_QUEUE: 'SET_UPLOAD_QUEUE',
  ADD_TO_UPLOAD_QUEUE: 'ADD_TO_UPLOAD_QUEUE',
  REMOVE_FROM_UPLOAD_QUEUE: 'REMOVE_FROM_UPLOAD_QUEUE',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_SORT: 'SET_SORT',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
  UPDATE_UPLOAD_PROGRESS: 'UPDATE_UPLOAD_PROGRESS',
  CLEAR_UPLOAD_PROGRESS: 'CLEAR_UPLOAD_PROGRESS',
  SET_STATS: 'SET_STATS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer 函数
function fileReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_FILES:
      return {
        ...state,
        files: action.payload,
        totalFiles: action.payload.length,
        totalSize: action.payload.reduce((sum, file) => sum + (file.size || 0), 0)
      };

    case ActionTypes.SET_FILTERED_FILES:
      return {
        ...state,
        filteredFiles: action.payload
      };

    case ActionTypes.ADD_FILE:
      const newFiles = [...state.files, action.payload];
      return {
        ...state,
        files: newFiles,
        totalFiles: newFiles.length,
        totalSize: newFiles.reduce((sum, file) => sum + (file.size || 0), 0)
      };

    case ActionTypes.REMOVE_FILE:
      const remainingFiles = state.files.filter(file => 
        file.fileId !== action.payload && file.messageId !== action.payload
      );
      return {
        ...state,
        files: remainingFiles,
        filteredFiles: state.filteredFiles.filter(file => 
          file.fileId !== action.payload && file.messageId !== action.payload
        ),
        totalFiles: remainingFiles.length,
        totalSize: remainingFiles.reduce((sum, file) => sum + (file.size || 0), 0)
      };

    case ActionTypes.UPDATE_FILE:
      const updatedFiles = state.files.map(file =>
        file.fileId === action.payload.fileId ? { ...file, ...action.payload } : file
      );
      return {
        ...state,
        files: updatedFiles,
        filteredFiles: state.filteredFiles.map(file =>
          file.fileId === action.payload.fileId ? { ...file, ...action.payload } : file
        )
      };

    case ActionTypes.SET_SELECTED_FILES:
      return {
        ...state,
        selectedFiles: new Set(action.payload)
      };

    case ActionTypes.ADD_SELECTED_FILE:
      const newSelected = new Set(state.selectedFiles);
      newSelected.add(action.payload);
      return {
        ...state,
        selectedFiles: newSelected
      };

    case ActionTypes.REMOVE_SELECTED_FILE:
      const updatedSelected = new Set(state.selectedFiles);
      updatedSelected.delete(action.payload);
      return {
        ...state,
        selectedFiles: updatedSelected
      };

    case ActionTypes.CLEAR_SELECTED_FILES:
      return {
        ...state,
        selectedFiles: new Set()
      };

    case ActionTypes.SET_UPLOAD_QUEUE:
      return {
        ...state,
        uploadQueue: action.payload
      };

    case ActionTypes.ADD_TO_UPLOAD_QUEUE:
      return {
        ...state,
        uploadQueue: [...state.uploadQueue, action.payload]
      };

    case ActionTypes.REMOVE_FROM_UPLOAD_QUEUE:
      return {
        ...state,
        uploadQueue: state.uploadQueue.filter(item => item.id !== action.payload)
      };

    case ActionTypes.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };

    case ActionTypes.SET_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy || state.sortBy,
        sortOrder: action.payload.sortOrder || state.sortOrder
      };

    case ActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ActionTypes.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: action.payload
      };

    case ActionTypes.UPDATE_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          [action.payload.fileId]: action.payload.progress
        }
      };

    case ActionTypes.CLEAR_UPLOAD_PROGRESS:
      const { [action.payload]: _removed, ...remainingProgress } = state.uploadProgress;
      // 显式使用_removed变量以避免ESLint警告
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const _unused = _removed;
      return {
        ...state,
        uploadProgress: remainingProgress
      };

    case ActionTypes.SET_STATS:
      return {
        ...state,
        totalFiles: action.payload.totalFiles || state.totalFiles,
        totalSize: action.payload.totalSize || state.totalSize
      };

    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        ...action.payload
      };

    default:
      return state;
  }
}

/**
 * File Context Provider 组件
 * 提供文件管理相关的全局状态
 */
export function FileProvider({ children }) {
  const [state, dispatch] = useReducer(fileReducer, initialState);
  
  // 使用文件管理和上传 Hooks
  const fileManager = useFileManager();
  const fileUpload = useFileUpload();

  // 同步 Hook 状态到 Context
  useEffect(() => {
    if (fileManager.files) {
      dispatch({ type: ActionTypes.SET_FILES, payload: fileManager.files });
    }
  }, [fileManager.files]);

  useEffect(() => {
    if (fileManager.filteredFiles) {
      dispatch({ type: ActionTypes.SET_FILTERED_FILES, payload: fileManager.filteredFiles });
    }
  }, [fileManager.filteredFiles]);

  useEffect(() => {
    if (fileManager.selectedFiles) {
      dispatch({ type: ActionTypes.SET_SELECTED_FILES, payload: Array.from(fileManager.selectedFiles) });
    }
  }, [fileManager.selectedFiles]);

  useEffect(() => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: fileManager.isLoading || fileUpload.isUploading });
  }, [fileManager.isLoading, fileUpload.isUploading]);

  useEffect(() => {
    if (fileUpload.uploadProgress) {
      dispatch({ type: ActionTypes.SET_UPLOAD_PROGRESS, payload: fileUpload.uploadProgress });
    }
  }, [fileUpload.uploadProgress]);

  // Action creators
  const actions = {
    /**
     * 设置文件列表
     * @param {Array} files - 文件列表
     */
    setFiles: useCallback((files) => {
      dispatch({ type: ActionTypes.SET_FILES, payload: files });
    }, []),

    /**
     * 添加文件
     * @param {Object} file - 文件对象
     */
    addFile: useCallback((file) => {
      dispatch({ type: ActionTypes.ADD_FILE, payload: file });
    }, []),

    /**
     * 删除文件
     * @param {string} fileId - 文件ID
     */
    removeFile: useCallback((fileId) => {
      dispatch({ type: ActionTypes.REMOVE_FILE, payload: fileId });
    }, []),

    /**
     * 更新文件信息
     * @param {Object} file - 更新的文件信息
     */
    updateFile: useCallback((file) => {
      dispatch({ type: ActionTypes.UPDATE_FILE, payload: file });
    }, []),

    /**
     * 选择文件
     * @param {string} fileId - 文件ID
     */
    selectFile: useCallback((fileId) => {
      if (state.selectedFiles.has(fileId)) {
        dispatch({ type: ActionTypes.REMOVE_SELECTED_FILE, payload: fileId });
      } else {
        dispatch({ type: ActionTypes.ADD_SELECTED_FILE, payload: fileId });
      }
    }, [state.selectedFiles]),

    /**
     * 全选文件
     */
    selectAllFiles: useCallback(() => {
      const allFileIds = state.filteredFiles.map(file => file.fileId);
      dispatch({ type: ActionTypes.SET_SELECTED_FILES, payload: allFileIds });
    }, [state.filteredFiles]),

    /**
     * 清除选择
     */
    clearSelection: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_SELECTED_FILES });
    }, []),

    /**
     * 设置搜索词
     * @param {string} searchTerm - 搜索词
     */
    setSearchTerm: useCallback((searchTerm) => {
      dispatch({ type: ActionTypes.SET_SEARCH_TERM, payload: searchTerm });
    }, []),

    /**
     * 设置排序
     * @param {string} sortBy - 排序字段
     * @param {string} sortOrder - 排序顺序
     */
    setSort: useCallback((sortBy, sortOrder) => {
      dispatch({ type: ActionTypes.SET_SORT, payload: { sortBy, sortOrder } });
    }, []),

    /**
     * 设置视图模式
     * @param {string} viewMode - 视图模式 ('grid' | 'list')
     */
    setViewMode: useCallback((viewMode) => {
      dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: viewMode });
    }, []),

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoading: useCallback((isLoading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
    }, []),

    /**
     * 设置错误信息
     * @param {string|Error} error - 错误信息
     */
    setError: useCallback((error) => {
      const errorMessage = error instanceof Error ? error.message : error;
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
    }, []),

    /**
     * 清除错误信息
     */
    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),

    /**
     * 更新上传进度
     * @param {string} fileId - 文件ID
     * @param {number} progress - 进度百分比
     */
    updateUploadProgress: useCallback((fileId, progress) => {
      dispatch({ type: ActionTypes.UPDATE_UPLOAD_PROGRESS, payload: { fileId, progress } });
    }, []),

    /**
     * 清除上传进度
     * @param {string} fileId - 文件ID
     */
    clearUploadProgress: useCallback((fileId) => {
      dispatch({ type: ActionTypes.CLEAR_UPLOAD_PROGRESS, payload: fileId });
    }, []),

    /**
     * 重置状态
     * @param {Object} newState - 新的状态（可选）
     */
    resetState: useCallback((newState = {}) => {
      dispatch({ type: ActionTypes.RESET_STATE, payload: newState });
    }, [])
  };

  const contextValue = {
    ...state,
    ...actions,
    // 暴露 Hook 方法
    fileManager,
    fileUpload
  };

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  );
}

/**
 * 使用 File Context 的 Hook
 * @returns {Object} File context 值和方法
 */
export function useFileContext() {
  const context = useContext(FileContext);
  
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  
  return context;
}

// 导出 Action 类型供其他组件使用
export { ActionTypes };

// 默认导出
export default FileContext;