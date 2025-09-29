/**
 * 文件选择管理器
 * 提供文件选择的核心业务逻辑，可用于各种文件管理场景
 */

export class FileSelectionManager {
  constructor(allFiles = [], filteredFiles = []) {
    this.allFiles = allFiles;
    this.filteredFiles = filteredFiles;
    this.selectedFiles = [];
    this.listeners = [];
  }

  /**
   * 添加状态变化监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   * @param {Function} listener - 监听器函数
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器状态变化
   */
  notifyListeners() {
    const state = this.getSelectionState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * 切换单个文件的选择状态
   * @param {string} fileId - 文件ID
   */
  toggleSelection(fileId) {
    const index = this.selectedFiles.indexOf(fileId);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    } else {
      this.selectedFiles.push(fileId);
    }
    this.notifyListeners();
  }

  /**
   * 选择单个文件
   * @param {string} fileId - 文件ID
   */
  selectFile(fileId) {
    if (!this.selectedFiles.includes(fileId)) {
      this.selectedFiles.push(fileId);
      this.notifyListeners();
    }
  }

  /**
   * 取消选择单个文件
   * @param {string} fileId - 文件ID
   */
  deselectFile(fileId) {
    const index = this.selectedFiles.indexOf(fileId);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
      this.notifyListeners();
    }
  }

  /**
   * 全选/取消全选
   * 基于当前过滤后的文件列表进行全选操作
   */
  selectAll() {
    const filteredFileIds = this.filteredFiles.map(file => file.id || file.messageId);
    const allFilteredSelected = filteredFileIds.every(id => this.selectedFiles.includes(id));
    
    if (allFilteredSelected && filteredFileIds.length > 0) {
      // 如果所有过滤后的文件都被选中，则取消选择这些文件
      this.selectedFiles = this.selectedFiles.filter(id => !filteredFileIds.includes(id));
    } else {
      // 否则选择所有过滤后的文件
      filteredFileIds.forEach(id => {
        if (!this.selectedFiles.includes(id)) {
          this.selectedFiles.push(id);
        }
      });
    }
    this.notifyListeners();
  }

  /**
   * 选择范围内的文件（支持Shift+点击）
   * @param {string} startFileId - 起始文件ID
   * @param {string} endFileId - 结束文件ID
   */
  selectRange(startFileId, endFileId) {
    const filteredFileIds = this.filteredFiles.map(file => file.id || file.messageId);
    const startIndex = filteredFileIds.indexOf(startFileId);
    const endIndex = filteredFileIds.indexOf(endFileId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    for (let i = minIndex; i <= maxIndex; i++) {
      const fileId = filteredFileIds[i];
      if (!this.selectedFiles.includes(fileId)) {
        this.selectedFiles.push(fileId);
      }
    }
    this.notifyListeners();
  }

  /**
   * 清空选择
   */
  clearSelection() {
    this.selectedFiles = [];
    this.notifyListeners();
  }

  /**
   * 反选
   */
  invertSelection() {
    const filteredFileIds = this.filteredFiles.map(file => file.id || file.messageId);
    const newSelection = filteredFileIds.filter(id => !this.selectedFiles.includes(id));
    this.selectedFiles = newSelection;
    this.notifyListeners();
  }

  /**
   * 根据条件选择文件
   * @param {Function} predicate - 筛选条件函数
   */
  selectByCondition(predicate) {
    const matchingFiles = this.filteredFiles.filter(predicate);
    const matchingIds = matchingFiles.map(file => file.id || file.messageId);
    
    matchingIds.forEach(id => {
      if (!this.selectedFiles.includes(id)) {
        this.selectedFiles.push(id);
      }
    });
    this.notifyListeners();
  }

  /**
   * 获取选择状态
   */
  getSelectionState() {
    const filteredFileIds = this.filteredFiles.map(file => file.id || file.messageId);
    const selectedInFiltered = this.selectedFiles.filter(id => filteredFileIds.includes(id));
    
    return {
      selectedFiles: [...this.selectedFiles],
      selectedCount: this.selectedFiles.length,
      selectedInFilteredCount: selectedInFiltered.length,
      isAllSelected: filteredFileIds.length > 0 && filteredFileIds.every(id => this.selectedFiles.includes(id)),
      isPartiallySelected: selectedInFiltered.length > 0 && selectedInFiltered.length < filteredFileIds.length,
      selectedTotalSize: this.selectedFiles.reduce((total, fileId) => {
        const file = this.allFiles.find(f => (f.id || f.messageId) === fileId);
        return total + (file ? (file.size || 0) : 0);
      }, 0),
      selectedFiles: this.getSelectedFileObjects()
    };
  }

  /**
   * 获取选中的文件对象
   */
  getSelectedFileObjects() {
    return this.selectedFiles.map(fileId => {
      return this.allFiles.find(f => (f.id || f.messageId) === fileId);
    }).filter(Boolean);
  }

  /**
   * 检查文件是否被选中
   * @param {string} fileId - 文件ID
   */
  isSelected(fileId) {
    return this.selectedFiles.includes(fileId);
  }

  /**
   * 更新文件列表
   * @param {Array} allFiles - 所有文件列表
   * @param {Array} filteredFiles - 过滤后的文件列表
   */
  updateFiles(allFiles, filteredFiles) {
    this.allFiles = allFiles;
    this.filteredFiles = filteredFiles;
    
    // 移除不存在的文件ID
    const allFileIds = allFiles.map(f => f.id || f.messageId);
    const oldSelectedCount = this.selectedFiles.length;
    this.selectedFiles = this.selectedFiles.filter(id => allFileIds.includes(id));
    
    // 如果选择发生了变化，通知监听器
    if (oldSelectedCount !== this.selectedFiles.length) {
      this.notifyListeners();
    }
  }

  /**
   * 获取选择统计信息
   */
  getSelectionStats() {
    const selectedFileObjects = this.getSelectedFileObjects();
    const stats = {
      totalCount: selectedFileObjects.length,
      totalSize: 0,
      typeStats: {},
      sizeStats: {
        small: 0,  // < 1MB
        medium: 0, // 1MB - 10MB
        large: 0   // > 10MB
      }
    };

    selectedFileObjects.forEach(file => {
      const size = file.size || 0;
      stats.totalSize += size;

      // 统计文件类型
      const type = file.type || 'unknown';
      stats.typeStats[type] = (stats.typeStats[type] || 0) + 1;

      // 统计文件大小分布
      if (size < 1024 * 1024) {
        stats.sizeStats.small++;
      } else if (size < 10 * 1024 * 1024) {
        stats.sizeStats.medium++;
      } else {
        stats.sizeStats.large++;
      }
    });

    return stats;
  }

  /**
   * 导出选择状态（用于保存/恢复）
   */
  exportState() {
    return {
      selectedFiles: [...this.selectedFiles],
      timestamp: Date.now()
    };
  }

  /**
   * 导入选择状态（用于保存/恢复）
   * @param {Object} state - 导出的状态
   */
  importState(state) {
    if (state && Array.isArray(state.selectedFiles)) {
      // 只导入仍然存在的文件
      const allFileIds = this.allFiles.map(f => f.id || f.messageId);
      this.selectedFiles = state.selectedFiles.filter(id => allFileIds.includes(id));
      this.notifyListeners();
    }
  }

  /**
   * 销毁管理器，清理所有监听器
   */
  destroy() {
    this.listeners = [];
    this.selectedFiles = [];
    this.allFiles = [];
    this.filteredFiles = [];
  }
}

export default FileSelectionManager;