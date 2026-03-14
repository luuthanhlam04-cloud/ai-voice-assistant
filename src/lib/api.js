// src/lib/api.js

/**
 * HÀM 1: CHUYỂN GIỌNG NÓI THÀNH VĂN BẢN (STT)
 * Ép server nhận diện tiếng Việt bằng tham số ?language=vi
 */
export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    const response = await fetch('https://sl-form-ai.ript.vn/api/v1/openai/stt?language=vi', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Lỗi nhận diện giọng nói');
    const data = await response.json();
    return data.result; // Trả về văn bản đã chuyển đổi
  } catch (error) {
    console.error("STT Error:", error);
    throw error;
  }
}

/**
 * HÀM 2: HỎI ĐÁP AI (LLM)
 * Ra lệnh nghiêm ngặt cho AI chỉ nói tiếng Việt và trả về định dạng JSON
 */
export async function askAI(prompt) {
  const systemContent = `
    Bạn là trợ lý ảo AIoT thông minh. 
    Mọi câu trả lời TUYỆT ĐỐI PHẢI bằng tiếng Việt tự nhiên. 
    Không dùng các ký tự đặc biệt, không dùng tiếng Anh.
    Trả về ĐÚNG định dạng JSON sau: {"cam_xuc": "vui vẻ/bình thường/hỗ trợ", "cau_tra_loi": "nội dung trả lời"}
  `;

  try {
    const response = await fetch('https://sl-form-ai.ript.vn/api/v1/openai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: prompt, 
        system_content: systemContent 
      })
    });

    if (!response.ok) throw new Error('Lỗi kết nối AI');
    const data = await response.json();
    
    // Parse chuỗi JSON từ kết quả trả về của AI
    return JSON.parse(data.result);
  } catch (error) {
    console.error("AI Error:", error);
    return { cam_xuc: "lỗi", cau_tra_loi: "Hệ thống đang bận, hãy thử lại sau." };
  }
}

/**
 * HÀM 3: PHÁT GIỌNG NÓI TIẾNG VIỆT (TTS)
 * Tối ưu chọn giọng vi-VN trên trình duyệt để tránh đọc ngọng tiếng Anh
 */
export const speakText = (text) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    // Dừng các yêu cầu phát âm trước đó
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Thiết lập ngôn ngữ tiếng Việt
    utterance.lang = 'vi-VN'; 

    // Lấy danh sách giọng đọc có sẵn trên máy
    const voices = window.speechSynthesis.getVoices();
    
    // Tìm giọng Việt Nam (thường có mã vi-VN)
    const vietnameseVoice = voices.find(v => v.lang.includes('vi-VN') || v.lang === 'vi_VN');

    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }

    // Tinh chỉnh tốc độ và độ cao
    utterance.rate = 1.0;  // Tốc độ bình thường
    utterance.pitch = 1.0; // Độ cao bình thường

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Trình duyệt không hỗ trợ Web Speech API.");
  }
};