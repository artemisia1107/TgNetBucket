const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const { TelegramStorage } = require('../src/telegram_storage');

describe('TelegramStorage', () => {
  let telegramStorage;
  let mockTelegramBot;

  beforeEach(() => {
    // 创建模拟的Telegram Bot
    mockTelegramBot = {
      sendDocument: sinon.stub().resolves({ message_id: '123' }),
      getFile: sinon.stub().resolves({ file_id: 'test_file_id', file_path: 'test_file_path' }),
      getFileLink: sinon.stub().resolves('https://test-file-link.com')
    };
    
    telegramStorage = new TelegramStorage({
      botToken: 'test_token',
      chatId: 'test_chat_id',
      telegramClient: mockTelegramBot
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should initialize with correct parameters', () => {
    expect(telegramStorage.botToken).to.equal('test_token');
    expect(telegramStorage.chatId).to.equal('test_chat_id');
  });

  it('should upload a file to Telegram', async () => {
    const fileBuffer = Buffer.from('test file content');
    const fileName = 'test.txt';
    
    const result = await telegramStorage.uploadFile(fileBuffer, fileName);
    
    expect(mockTelegramBot.sendDocument.calledOnce).to.be.true;
    expect(mockTelegramBot.sendDocument.firstCall.args[0]).to.equal('test_chat_id');
    expect(result).to.have.property('fileId');
    expect(result).to.have.property('messageId', '123');
  });

  it('should download a file from Telegram', async () => {
    const fileId = 'test_file_id';
    
    const result = await telegramStorage.downloadFile(fileId);
    
    expect(mockTelegramBot.getFile.calledOnce).to.be.true;
    expect(mockTelegramBot.getFile.firstCall.args[0]).to.equal(fileId);
    expect(mockTelegramBot.getFileLink.calledOnce).to.be.true;
    expect(result).to.equal('https://test-file-link.com');
  });

  it('should list files from Telegram', async () => {
    // 模拟获取消息历史的功能
    mockTelegramBot.getChat = sinon.stub().resolves({ id: 'test_chat_id' });
    mockTelegramBot.getChatHistory = sinon.stub().resolves([
      { message_id: '1', document: { file_id: 'file1', file_name: 'test1.txt' } },
      { message_id: '2', document: { file_id: 'file2', file_name: 'test2.txt' } }
    ]);
    
    const result = await telegramStorage.listFiles();
    
    expect(mockTelegramBot.getChatHistory.calledOnce).to.be.true;
    expect(result).to.be.an('array').with.lengthOf(2);
    expect(result[0]).to.have.property('fileId', 'file1');
    expect(result[0]).to.have.property('fileName', 'test1.txt');
    expect(result[1]).to.have.property('fileId', 'file2');
    expect(result[1]).to.have.property('fileName', 'test2.txt');
  });

  it('should delete a file from Telegram', async () => {
    mockTelegramBot.deleteMessage = sinon.stub().resolves(true);
    
    const messageId = '123';
    const result = await telegramStorage.deleteFile(messageId);
    
    expect(mockTelegramBot.deleteMessage.calledOnce).to.be.true;
    expect(mockTelegramBot.deleteMessage.firstCall.args[0]).to.equal('test_chat_id');
    expect(mockTelegramBot.deleteMessage.firstCall.args[1]).to.equal(messageId);
    expect(result).to.be.true;
  });
});