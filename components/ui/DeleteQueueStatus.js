/**
 * 删除队列状态组件
 * 显示删除队列的状态信息和管理功能
 */

import { useState, useEffect, useCallback } from 'react';

const DeleteQueueStatus = () => {
  const [queueStatus, setQueueStatus] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    quality: 'unknown',
    timestamp: null
  });
  const [isVisible, setIsVisible] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState(null);
  const [networkMonitor, setNetworkMonitor] = useState(null);

  /**
   * 处理网络状态变化
   * @param {Object} status - 网络状态对象
   */
  const handleNetworkStatusChange = useCallback((status) => {
    setNetworkStatus(status);
  }, []);

  /**
   * 更新队列状态
   * @param {DeleteQueue} queue - 删除队列实例
   */
  const updateQueueStatus = useCallback((queue) => {
    if (queue) {
      const status = queue.getQueueStatus();
      setQueueStatus(status);
      
      // 如果有待处理的任务，自动显示状态
      if (status.total > 0 && !isVisible) {
        setIsVisible(true);
      }
      
      // 如果队列为空，延迟隐藏状态
      if (status.total === 0 && isVisible) {
        setTimeout(() => setIsVisible(false), 3000);
      }
    }
  }, [isVisible]);

  useEffect(() => {
    // 动态导入删除队列模块和网络监控器
    const initializeComponents = async () => {
      try {
        const [
          { getDeleteQueue },
          { getNetworkMonitor }
        ] = await Promise.all([
          import('../../utils/deleteQueue'),
          import('../../utils/networkMonitor')
        ]);
        
        const queue = getDeleteQueue();
        const monitor = getNetworkMonitor();
        
        setDeleteQueue(queue);
        setNetworkMonitor(monitor);
        
        // 立即更新状态
        updateQueueStatus(queue);
        
        // 监听网络状态变化
        monitor.addListener(handleNetworkStatusChange);
        
        // 获取初始网络状态
        const initialStatus = monitor.getStatus();
        setNetworkStatus(initialStatus);
        
      } catch (error) {
        console.error('初始化组件失败:', error);
      }
    };

    initializeComponents();
    
    // 清理函数
    return () => {
      if (networkMonitor) {
        networkMonitor.removeListener(handleNetworkStatusChange);
      }
    };
  }, [handleNetworkStatusChange, updateQueueStatus, networkMonitor]);

  useEffect(() => {
    // 定期更新队列状态
    const interval = setInterval(() => {
      if (deleteQueue) {
        updateQueueStatus(deleteQueue);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [deleteQueue, updateQueueStatus]);

  /**
   * 重试失败的任务
   */
  const handleRetryFailed = async () => {
    if (deleteQueue) {
      await deleteQueue.retryFailedTasks();
      updateQueueStatus(deleteQueue);
    }
  };

  /**
   * 清空队列
   */
  const handleClearQueue = () => {
    // eslint-disable-next-line no-alert
    if (deleteQueue && confirm('确定要清空删除队列吗？这将取消所有待删除的文件。')) {
      deleteQueue.clearQueue();
      updateQueueStatus(deleteQueue);
      setIsVisible(false);
    }
  };

  /**
   * 获取网络状态图标
   * @returns {string} Font Awesome 图标类名
   */
  const getNetworkStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return 'fas fa-wifi-slash text-danger';
    }

    switch (networkStatus.quality) {
      case 'excellent':
        return 'fas fa-wifi text-success';
      case 'good':
        return 'fas fa-wifi text-success';
      case 'fair':
        return 'fas fa-wifi text-warning';
      case 'poor':
        return 'fas fa-wifi text-danger';
      default:
        return 'fas fa-wifi text-muted';
    }
  };

  /**
   * 获取网络状态文本
   * @returns {string} 状态描述
   */
  const getNetworkStatusText = () => {
    if (!networkStatus.isOnline) {
      return '网络已断开';
    }

    switch (networkStatus.quality) {
      case 'excellent':
        return '网络连接优秀';
      case 'good':
        return '网络连接良好';
      case 'fair':
        return '网络连接一般';
      case 'poor':
        return '网络连接较差';
      default:
        return '网络状态未知';
    }
  };

  /**
   * 切换显示状态
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // 如果没有队列状态或队列为空且不可见，不显示组件
  if (!queueStatus || (queueStatus.total === 0 && !isVisible)) {
    return null;
  }

  return (
    <div className="delete-queue-status">
      {/* 队列状态指示器 */}
      <div 
        className={`queue-indicator ${isVisible ? 'expanded' : 'collapsed'}`}
        onClick={toggleVisibility}
        title="点击查看删除队列状态"
      >
        <i className="fas fa-trash-alt" />
        {queueStatus.total > 0 && (
          <span className="queue-count">{queueStatus.total}</span>
        )}
        {queueStatus.isProcessing && (
          <i className="fas fa-spinner fa-spin processing-icon" />
        )}
      </div>

      {/* 详细状态面板 */}
      {isVisible && (
        <div className="queue-details">
          <div className="queue-header">
            <h4>
              <i className="fas fa-list" /> 删除队列状态
            </h4>
            <button 
              className="btn-close"
              onClick={() => setIsVisible(false)}
              title="关闭"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="queue-stats">
            <div className="stat-item">
              <i className="fas fa-clock text-warning" />
              <span>待处理: {queueStatus.pending}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-spinner fa-spin text-info" />
              <span>处理中: {queueStatus.processing}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-times-circle text-danger" />
              <span>失败: {queueStatus.failed}</span>
            </div>
          </div>

          <div className="network-status">
            <div className="network-info">
              <i className={getNetworkStatusIcon()} />
              <span>{getNetworkStatusText()}</span>
              {networkStatus.responseTime && (
                <small className="response-time">
                  ({networkStatus.responseTime}ms)
                </small>
              )}
            </div>
            {!networkStatus.isOnline && (
              <div className="network-warning">
                <i className="fas fa-exclamation-triangle text-warning" />
                <span>网络断开时删除操作将排队等待</span>
              </div>
            )}
          </div>

          {queueStatus.failed > 0 && (
            <div className="queue-actions">
              <button 
                className="btn btn-sm btn-warning"
                onClick={handleRetryFailed}
                title="重试所有失败的任务"
              >
                <i className="fas fa-redo" /> 重试失败任务
              </button>
            </div>
          )}

          {queueStatus.total > 0 && (
            <div className="queue-actions">
              <button 
                className="btn btn-sm btn-danger"
                onClick={handleClearQueue}
                title="清空删除队列"
              >
                <i className="fas fa-trash" /> 清空队列
              </button>
            </div>
          )}

          {!queueStatus.isOnline && queueStatus.total > 0 && (
            <div className="offline-notice">
              <i className="fas fa-info-circle" />
              <span>网络离线，队列将在网络恢复后自动处理</span>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .delete-queue-status {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: inherit;
        }

        .queue-indicator {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50px;
          padding: 12px 16px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          min-width: 60px;
          justify-content: center;
        }

        .queue-indicator:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .queue-indicator.expanded {
          border-radius: 12px 12px 0 0;
        }

        .queue-count {
          background: #ff4757;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 12px;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
        }

        .processing-icon {
          color: #feca57;
        }

        .queue-details {
          background: white;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          padding: 16px;
          min-width: 280px;
          border-top: 1px solid #e0e0e0;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .queue-header h4 {
          margin: 0;
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-close {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: #f0f0f0;
          color: #666;
        }

        .queue-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }

        .network-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .queue-actions {
          margin-top: 8px;
        }

        .queue-actions .btn {
          width: 100%;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-warning {
          background: #ffc107;
          color: #212529;
        }

        .btn-warning:hover {
          background: #e0a800;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .offline-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 8px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #856404;
        }

        .text-success { color: #28a745 !important; }
        .text-danger { color: #dc3545 !important; }
        .text-warning { color: #ffc107 !important; }
        .text-info { color: #17a2b8 !important; }
      `}} />
    </div>
  );
};

export default DeleteQueueStatus;