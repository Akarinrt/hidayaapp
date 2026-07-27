import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { topic, tone, isBilingual } = await request.json();
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

    if (!DEEPSEEK_KEY || DEEPSEEK_KEY === "YOUR_DEEPSEEK_KEY") {
      return NextResponse.json({ success: false, error: "Chưa cấu hình DEEPSEEK_API_KEY" }, { status: 400 });
    }

    // Map tone sang prompt
    let tonePrompt = "chuyên nghiệp và lịch sự";
    if (tone === 'humorous') tonePrompt = "hài hước, vui nhộn và gần gũi";
    if (tone === 'sale') tonePrompt = "thu hút, kích thích chốt sale và kêu gọi hành động (Call to Action)";

    // Map bilingual
    let languagePrompt = "Viết bài hoàn toàn bằng Tiếng Việt.";
    if (isBilingual) {
      languagePrompt = "Hãy viết bài dưới dạng SONG NGỮ (Tiếng Việt ở trên, Tiếng Anh ở dưới), phân cách nhau rõ ràng.";
    }

    // 1. Gọi DeepSeek AI để sinh bài viết và keyword ảnh
    const systemPrompt = `Bạn là một chuyên gia sáng tạo nội dung mạng xã hội cho công ty du lịch HIDAYA Travel. 
    Yêu cầu:
    - Giọng văn: ${tonePrompt}.
    - Ngôn ngữ: ${languagePrompt}
    - Format: Bắt đầu bằng 1 tiêu đề hấp dẫn, nội dung chia đoạn dễ đọc, kết thúc bằng hashtag liên quan đến du lịch.
    - Lưu ý: Không dùng quá nhiều icon. KHÔNG cần giải thích, chỉ trả về nội dung bài viết.
    - Cuối cùng, ở dòng dưới cùng, hãy viết định dạng [KEYWORD: <từ khóa tiếng anh ngắn gọn nhất miêu tả bài viết để tìm ảnh>]`;

    const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Chủ đề/Ý tưởng: ${topic}` }
        ]
      })
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) throw new Error("Lỗi gọi DeepSeek: " + (aiData.error?.message || "Unknown error"));

    const fullResponse = aiData.choices[0].message.content;
    
    // Tách keyword và nội dung
    let content = fullResponse;
    let keyword = "travel"; // default
    
    const keywordMatch = fullResponse.match(/\[KEYWORD:\s*(.*?)\]/i);
    if (keywordMatch) {
      keyword = keywordMatch[1].trim();
      content = fullResponse.replace(/\[KEYWORD:.*?\]/i, '').trim();
    }

    // 2. Tìm ảnh từ Unsplash nếu có KEY
    let imageUrl = null;
    if (UNSPLASH_KEY && UNSPLASH_KEY !== "YOUR_UNSPLASH_KEY") {
      const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword + " travel landscape")}&per_page=1&client_id=${UNSPLASH_KEY}`);
      const unsplashData = await unsplashRes.json();
      if (unsplashData.results && unsplashData.results.length > 0) {
        imageUrl = unsplashData.results[0].urls.regular;
      }
    }

    return NextResponse.json({ success: true, content, imageUrl, keyword });

  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
