import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');

  // 获取文件列表
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data.files || []);
    } catch (error) {
      setMessage(`获取文件列表失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 上传文件
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    setMessage('正在上传文件...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setMessage('文件上传成功！');
      fetchFiles(); // 刷新文件列表
    } catch (error) {
      setMessage(`文件上传失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 下载文件
  const handleDownload = (fileId, fileName) => {
    window.open(`/api/download?fileId=${fileId}`, '_blank');
  };

  // 删除文件
  const handleDelete = async (messageId) => {
    if (!confirm('确定要删除此文件吗？')) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/files?messageId=${messageId}`);
      setMessage('文件删除成功！');
      fetchFiles(); // 刷新文件列表
    } catch (error) {
      setMessage(`文件删除失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取文件列表
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>TgNetBucket - Telegram文件存储</title>
        <meta name="description" content="使用Telegram存储文件的网络存储桶" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">TgNetBucket</h1>
        <p className="description">使用Telegram存储文件的网络存储桶</p>

        <div className="upload-section">
          <label className="upload-button">
            选择文件上传
            <input
              type="file"
              onChange={handleUpload}
              disabled={isLoading}
              style={{ display: 'none' }}
            />
          </label>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span>{uploadProgress}%</span>
            </div>
          )}

          {message && <p className="message">{message}</p>}
        </div>

        <div className="files-section">
          <h2>文件列表</h2>
          {isLoading && <p>加载中...</p>}
          
          {!isLoading && files.length === 0 && (
            <p>没有文件</p>
          )}

          <ul className="file-list">
            {files.map((file) => (
              <li key={file.fileId} className="file-item">
                <span className="file-name">{file.fileName}</span>
                <div className="file-actions">
                  <button
                    onClick={() => handleDownload(file.fileId, file.fileName)}
                    className="download-button"
                  >
                    下载
                  </button>
                  <button
                    onClick={() => handleDelete(file.messageId)}
                    className="delete-button"
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 3rem;
          text-align: center;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 1rem 0;
        }

        .upload-section {
          margin: 2rem 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .upload-button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }

        .upload-button:hover {
          background-color: #0051a8;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #eee;
          border-radius: 10px;
          margin: 1rem 0;
          overflow: hidden;
          position: relative;
        }

        .progress {
          height: 100%;
          background-color: #0070f3;
          transition: width 0.3s ease;
        }

        .progress-bar span {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-weight: bold;
        }

        .message {
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          background-color: #f0f0f0;
          border-radius: 5px;
          text-align: center;
        }

        .files-section {
          width: 100%;
        }

        .file-list {
          list-style: none;
          padding: 0;
          width: 100%;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 5px;
          margin-bottom: 0.5rem;
        }

        .file-name {
          flex: 1;
          word-break: break-all;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
        }

        .download-button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        }

        .delete-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}