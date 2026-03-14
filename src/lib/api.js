// src/lib/api.js

// ... giữ các hàm cũ (transcribeAudio, askAI)

export const speakText = (text) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    // Hủy các yêu cầu phát âm thanh trước đó để tránh chồng chéo
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN'; // Thiết lập tiếng Việt
    utterance.rate = 1.0;     // Tốc độ nói
    utterance.pitch = 1.0;    // Độ cao của giọng

    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Trình duyệt không hỗ trợ Speech Synthesis");
  }
};