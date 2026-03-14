// src/lib/api.js

// 1. Hàm chuyển giọng nói thành văn bản
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const response = await fetch('https://sl-form-ai.ript.vn/api/v1/openai/stt?language=vi', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Lỗi STT');
  const data = await response.json();
  return data.result;
}

// 2. Hàm hỏi đáp AI (Đây là hàm bạn đang bị thiếu export)
export async function askAI(prompt) {
  const systemContent = `Bạn là trợ lý ảo AIoT PTIT. Trả về JSON: {"cam_xuc": "...", "cau_tra_loi": "..."}`;

  const response = await fetch('https://sl-form-ai.ript.vn/api/v1/openai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        text: prompt, 
        system_content: systemContent 
    })
  });

  if (!response.ok) throw new Error('Lỗi Chat API');
  const data = await response.json();
  
  // Lưu ý: Kết quả trả về từ API này cần được parse JSON vì nó là chuỗi
  return JSON.parse(data.result); 
}

// 3. Hàm phát giọng nói
export const speakText = (text) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  }
};