"use client";
import { useState, useRef } from 'react';
import { Mic, Send, Square, Bot, User } from 'lucide-react'; // Import icons
import useChatStore from '../store/useChatStore';
import { transcribeAudio, askAI, speakText } from '../lib/api';
import VoiceVisualizer from './VoiceVisualizer';

export default function ChatInterface() {
  const { messages, isRecording, isProcessing, addMessage, setRecording, setProcessing } = useChatStore();
  const [inputText, setInputText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const processUserInput = async (text) => {
    addMessage({ sender: 'user', text: text });
    setProcessing(true);

    try {
      const aiResponse = await askAI(text);
      const responseText = aiResponse.cau_tra_loi;
      const emotion = aiResponse.cam_xuc;

      addMessage({ sender: 'bot', text: responseText, emotion: emotion });
      speakText(responseText);
    } catch (error) {
      addMessage({ sender: 'bot', text: "Hệ thống bận, bạn thử lại nhé!" });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim() || isProcessing) return;
    processUserInput(inputText);
    setInputText('');
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setProcessing(true);
          const transcript = await transcribeAudio(audioBlob);
          if (transcript) await processUserInput(transcript);
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        setRecording(true);
      } catch (err) { alert("Lỗi Mic!"); }
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-50 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-white font-semibold">AI Assistant</h2>
          <p className="text-blue-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Trực tuyến
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-slate-200'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm rounded-tl-none border border-slate-100'}`}>
                {msg.text}
                {msg.emotion && <div className="mt-1 text-[10px] uppercase tracking-wider opacity-60 font-bold">{msg.emotion}</div>}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && <div className="flex gap-2 items-center text-slate-400 text-xs"><div className="animate-spin">◌</div> Đang xử lý...</div>}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-4">
        <VoiceVisualizer isActive={isRecording} />
        <div className="flex gap-2 items-center">
          <button 
            onClick={handleToggleRecord}
            className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white scale-110' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
          </button>
          
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Hỏi tôi bất cứ điều gì..."
              className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
            />
            <button onClick={handleSendText} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}