"use client";
import { useState, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { transcribeAudio, askAI } from '../lib/api';

export default function ChatInterface() {
  const { messages, isRecording, isProcessing, addMessage, setRecording, setProcessing } = useChatStore();
  const [inputText, setInputText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Hàm phát âm thanh phản hồi (TTS)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Hàm định tuyến và xử lý logic cốt lõi
  const processUserInput = async (text) => {
    addMessage({ sender: 'user', text: text });
    setProcessing(true);

    const lowerText = text.toLowerCase();
    const keywords = ["tuyển sinh", "xét tuyển", "ptit", "aiot"];
    const hasKeyword = keywords.some(kw => lowerText.includes(kw));

    let responseText = "";
    let emotion = "";

    try {
      if (hasKeyword) {
        // Luồng 1: Khớp từ khóa
        responseText = "Vui lòng truy cập link bên dưới: https://tuyensinh.ptit.edu.vn/";
        emotion = "Hỗ trợ";
      } else {
        // Luồng 2: Gọi AI Hỏi đáp
        const aiResponse = await askAI(text);
        responseText = aiResponse.cau_tra_loi;
        emotion = aiResponse.cam_xuc;
      }
    } catch (error) {
      responseText = "Hệ thống đang gặp sự cố kết nối, vui lòng thử lại.";
    }

    addMessage({ sender: 'bot', text: responseText, emotion: emotion });
    speakText(responseText);
    setProcessing(false);
  };

  const handleSendText = () => {
    if (!inputText.trim() || isProcessing) return;
    const textToProcess = inputText;
    setInputText('');
    processUserInput(textToProcess);
  };

  // Cấu hình MediaRecorder thu âm giọng nói
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Dừng ghi âm
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      // Bắt đầu ghi âm
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setProcessing(true);
          try {
            const transcript = await transcribeAudio(audioBlob);
            if (transcript) {
              await processUserInput(transcript);
            }
          } catch (error) {
            addMessage({ sender: 'bot', text: "Lỗi nhận diện giọng nói." });
            setProcessing(false);
          }
          // Giải phóng bộ nhớ mic
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (error) {
        alert("Không thể truy cập Micro.");
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      <div className="bg-blue-600 text-white p-4 text-center font-bold text-lg">
        Trợ Lý Ảo Của Tôi
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 underline">$1</a>') }} />
              {msg.emotion && <span className="ml-2 text-xs font-semibold text-gray-500 block mt-1">[{msg.emotion}]</span>}
            </div>
          </div>
        ))}
        {isProcessing && <div className="text-gray-500 text-sm italic">Hệ thống đang xử lý...</div>}
      </div>

      <div className="p-4 border-t flex gap-2 items-center bg-gray-50">
        <button 
          onClick={handleToggleRecord}
          disabled={isProcessing}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
        
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
          disabled={isProcessing}
          placeholder="Nhập câu hỏi hoặc nhấn mic để nói..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-black disabled:bg-gray-100"
        />
        
        <button 
          onClick={handleSendText}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:bg-blue-300"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}