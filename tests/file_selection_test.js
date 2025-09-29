/**
 * 文件选择功能测试
 * 测试选择全部文件的业务逻辑
 */

const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');

// 模拟文件选择逻辑类
class FileSelectionManager {
  constructor(allFiles = [], filteredFiles = []) {
    this.allFiles = allFiles;
    this.filteredFiles = filteredFiles;
    this.selectedFiles = [];
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
  }

  /**
   * 全选/取消全选
   */
  selectAll() {
    const filteredFileIds = this.filteredFiles.map(file => file.id);
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
  }

  /**
   * 清空选择
   */
  clearSelection() {
    this.selectedFiles = [];
  }

  /**
   * 获取选择状态
   */
  getSelectionState() {
    const filteredFileIds = this.filteredFiles.map(file => file.id);
    const selectedInFiltered = this.selectedFiles.filter(id => filteredFileIds.includes(id));
    
    return {
      selectedFiles: [...this.selectedFiles],
      selectedCount: this.selectedFiles.length,
      isAllSelected: filteredFileIds.length > 0 && filteredFileIds.every(id => this.selectedFiles.includes(id)),
      isPartiallySelected: selectedInFiltered.length > 0 && selectedInFiltered.length < filteredFileIds.length,
      selectedTotalSize: this.selectedFiles.reduce((total, fileId) => {
        const file = this.allFiles.find(f => f.id === fileId);
        return total + (file ? file.size : 0);
      }, 0)
    };
  }

  /**
   * 更新文件列表
   */
  updateFiles(allFiles, filteredFiles) {
    this.allFiles = allFiles;
    this.filteredFiles = filteredFiles;
    
    // 移除不存在的文件ID
    const allFileIds = allFiles.map(f => f.id);
    this.selectedFiles = this.selectedFiles.filter(id => allFileIds.includes(id));
  }
}

describe('文件选择功能测试', () => {
  let mockFiles;
  let mockFilteredFiles;
  let selectionManager;

  beforeEach(() => {
    // 模拟文件数据
    mockFiles = [
      { id: '1', name: 'test1.txt', size: 1024, type: 'text/plain' },
      { id: '2', name: 'test2.jpg', size: 2048, type: 'image/jpeg' },
      { id: '3', name: 'test3.pdf', size: 3072, type: 'application/pdf' },
      { id: '4', name: 'test4.doc', size: 4096, type: 'application/msword' }
    ];

    mockFilteredFiles = [
      { id: '1', name: 'test1.txt', size: 1024, type: 'text/plain' },
      { id: '2', name: 'test2.jpg', size: 2048, type: 'image/jpeg' }
    ];

    selectionManager = new FileSelectionManager(mockFiles, mockFiles);
  });

  describe('全选功能', () => {
    it('应该能够选择所有文件', () => {
      selectionManager.selectAll();
      const state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal(['1', '2', '3', '4']);
      expect(state.isAllSelected).to.be.true;
      expect(state.selectedCount).to.equal(4);
    });

    it('应该能够选择过滤后的所有文件', () => {
      selectionManager = new FileSelectionManager(mockFiles, mockFilteredFiles);
      selectionManager.selectAll();
      const state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal(['1', '2']);
      expect(state.isAllSelected).to.be.true;
      expect(state.selectedCount).to.equal(2);
    });

    it('当所有文件都被选中时，再次调用全选应该取消全选', () => {
      // 先全选
      selectionManager.selectAll();
      let state = selectionManager.getSelectionState();
      expect(state.isAllSelected).to.be.true;

      // 再次全选应该取消全选
      selectionManager.selectAll();
      state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal([]);
      expect(state.isAllSelected).to.be.false;
      expect(state.selectedCount).to.equal(0);
    });

    it('当部分文件被选中时，调用全选应该选择所有文件', () => {
      // 先选择部分文件
      selectionManager.toggleSelection('1');
      selectionManager.toggleSelection('2');
      
      let state = selectionManager.getSelectionState();
      expect(state.selectedCount).to.equal(2);
      expect(state.isPartiallySelected).to.be.true;

      // 调用全选
      selectionManager.selectAll();
      state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal(['1', '2', '3', '4']);
      expect(state.isAllSelected).to.be.true;
      expect(state.isPartiallySelected).to.be.false;
    });
  });

  describe('单个文件选择', () => {
    it('应该能够选择单个文件', () => {
      selectionManager.toggleSelection('1');
      const state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal(['1']);
      expect(state.selectedCount).to.equal(1);
      expect(state.isPartiallySelected).to.be.true;
    });

    it('应该能够取消选择单个文件', () => {
      // 先选择
      selectionManager.toggleSelection('1');
      let state = selectionManager.getSelectionState();
      expect(state.selectedFiles).to.deep.equal(['1']);

      // 再取消选择
      selectionManager.toggleSelection('1');
      state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal([]);
      expect(state.selectedCount).to.equal(0);
    });
  });

  describe('清空选择', () => {
    it('应该能够清空所有选择', () => {
      // 先选择一些文件
      selectionManager.toggleSelection('1');
      selectionManager.toggleSelection('2');
      selectionManager.toggleSelection('3');
      
      let state = selectionManager.getSelectionState();
      expect(state.selectedCount).to.equal(3);

      // 清空选择
      selectionManager.clearSelection();
      state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal([]);
      expect(state.selectedCount).to.equal(0);
      expect(state.isAllSelected).to.be.false;
      expect(state.isPartiallySelected).to.be.false;
    });
  });

  describe('选择状态计算', () => {
    it('应该正确计算选择状态', () => {
      selectionManager = new FileSelectionManager(mockFiles, mockFilteredFiles);
      
      // 初始状态
      let state = selectionManager.getSelectionState();
      expect(state.isAllSelected).to.be.false;
      expect(state.isPartiallySelected).to.be.false;

      // 选择部分文件
      selectionManager.toggleSelection('1');
      state = selectionManager.getSelectionState();
      expect(state.isAllSelected).to.be.false;
      expect(state.isPartiallySelected).to.be.true;

      // 选择所有过滤后的文件
      selectionManager.toggleSelection('2');
      state = selectionManager.getSelectionState();
      expect(state.isAllSelected).to.be.true;
      expect(state.isPartiallySelected).to.be.false;
    });

    it('应该正确计算选中文件的总大小', () => {
      selectionManager.toggleSelection('1'); // 1024
      selectionManager.toggleSelection('2'); // 2048
      
      const state = selectionManager.getSelectionState();
      expect(state.selectedTotalSize).to.equal(3072);
    });
  });

  describe('文件列表变化处理', () => {
    it('当过滤后的文件列表变化时，应该更新选择状态', () => {
      selectionManager = new FileSelectionManager(mockFiles, mockFilteredFiles);
      
      // 选择所有过滤后的文件
      selectionManager.selectAll();
      let state = selectionManager.getSelectionState();
      expect(state.selectedFiles).to.deep.equal(['1', '2']);
      expect(state.isAllSelected).to.be.true;

      // 更改过滤条件，只显示一个文件
      const newFilteredFiles = [mockFiles[0]];
      selectionManager.updateFiles(mockFiles, newFilteredFiles);
      state = selectionManager.getSelectionState();
      
      expect(state.isAllSelected).to.be.true; // 因为过滤后的文件都被选中了
      expect(state.selectedCount).to.equal(2); // 但选中的文件数量没变
    });

    it('当文件被删除时，应该从选择列表中移除', () => {
      // 选择所有文件
      selectionManager.selectAll();
      let state = selectionManager.getSelectionState();
      expect(state.selectedFiles).to.deep.equal(['1', '2', '3', '4']);

      // 删除一个文件
      const newFiles = mockFiles.filter(f => f.id !== '2');
      selectionManager.updateFiles(newFiles, newFiles);
      state = selectionManager.getSelectionState();

      expect(state.selectedFiles).to.deep.equal(['1', '3', '4']);
      expect(state.selectedCount).to.equal(3);
    });
  });
});