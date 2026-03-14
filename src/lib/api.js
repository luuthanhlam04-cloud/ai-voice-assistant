// Gọi API Speech-to-Text chuyển đổi file âm thanh thành văn bản
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  // Khởi tạo tên file giả lập kèm định dạng webm mặc định của trình duyệt
  formData.append('file', audioBlob, 'recording.webm');

  const response = await fetch('https://sl-form-ai.ript.vn/api/v1/openai/stt?language=vi', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Lỗi STT API');
  const data = await response.json();
  return data.result;
}

// Gọi API OpenAI Chat xử lý logic AI và phân tích cảm xúc
export async function askAI(prompt) {
  const systemContent = `Bạn là một trợ lý ảo thân thiện, ôn nhu. Đọc câu hỏi và thực hiện:
1. Phân tích cảm xúc người dùng (Tích cực, Tiêu cực, Trung tính).
2. Trả lời câu hỏi ngắn gọn.
BẮT BUỘC trả về định dạng JSON: {"cam_xuc": "Nhãn", "cau_tra_loi": "Nội dung"}`;

  const response = await fetch('https://sl-form-ai.ript.vn/api/v1/openai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: prompt, system_content: systemContent })
  });

  if (!response.ok) throw new Error('Lỗi Chat API');
  const data = await response.json();
  
  // Phân tích chuỗi JSON trả về từ AI
  try {
    return JSON.parse(data.result);
  } catch (e) {
    return { cam_xuc: "Trung tính", cau_tra_loi: data.result };
  }
}