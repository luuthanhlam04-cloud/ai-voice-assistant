"use client";
import { useState } from 'react';
import useChatStore from '../store/useChatStore';

export default function ChatInterface() {
  const { messages, isRecording, isProcessing, addMessage, setRecording } = useChatStore();
  const [inputText, setInputText] = useState('');

  const handleSendText = () => {
    if (!inputText.trim()) return;
    
    // Thêm tin nhắn của người dùng vào giao diện
    addMessage({ sender: 'user', text: inputText });
    setInputText('');
    
    // Điểm neo: Logic gọi API xử lý văn bản sẽ được chèn vào đây ở giai đoạn sau
  };

  const handleToggleRecord = () => {
    setRecording(!isRecording);
    // Điểm neo: Logic kích hoạt MediaRecorder sẽ được chèn vào đây ở giai đoạn sau
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-center font-bold text-lg">
        Trợ Lý Ảo Của Tôi
      </div>
      
      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.text}
              {msg.emotion && <span className="ml-2 text-sm opacity-70">[{msg.emotion}]</span>}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="text-gray-500 text-sm italic">AI đang xử lý...</div>
        )}
      </div>

      {/* Khu vực nhập liệu */}
      <div className="p-4 border-t flex gap-2 items-center bg-gray-50">
        <button 
          onClick={handleToggleRecord}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="Ghi âm"
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
        
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
          placeholder="Nhập câu hỏi hoặc nhấn mic để nói..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-black"
        />
        
        <button 
          onClick={handleSendText}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}