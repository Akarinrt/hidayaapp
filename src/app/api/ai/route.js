import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { topic } = await request.json();
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

    if (!DEEPSEEK_KEY || DEEPSEEK_KEY === "YOUR_DEEPSEEK_KEY") {
      return NextResponse.json({ success: false, error: "Chưa cấu hình DEEPSEEK_API_KEY" }, { status: 400 });
    }

    // 1. Gọi DeepSeek AI để sinh bài viết và keyword ảnh
    const aiPrompt = `Bạn là một chuyên gia sáng tạo nội dung mạng xã hội. 
    Hãy viết một bài đăng Facebook hấp dẫn về chủ đề: "${topic}". 
    Yêu cầu: Viết khoảng 3-4 câu, có sử dụng emoji phù hợp, kèm 2-3 hashtag.
    Và cuối cùng, ở dòng dưới cùng, hãy viết định dạng [KEYWORD: <từ khóa tiếng anh ngắn gọn nhất miêu tả bài viết để tìm ảnh>]`;

    const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: aiPrompt }]
      })
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) throw new Error("Lỗi gọi DeepSeek: " + (aiData.error?.message || "Unknown error"));

    const fullResponse = aiData.choices[0].message.content;
    
    // Tách keyword và nội dung
    let content = fullResponse;
    let keyword = "technology"; // default
    
    const keywordMatch = fullResponse.match(/\[KEYWORD:\s*(.*?)\]/i);
    if (keywordMatch) {
      keyword = keywordMatch[1].trim();
      content = fullResponse.replace(/\[KEYWORD:.*?\]/i, '').trim();
    }

    // 2. Tìm ảnh từ Unsplash nếu có KEY
    let imageUrl = null;
    if (UNSPLASH_KEY && UNSPLASH_KEY !== "YOUR_UNSPLASH_KEY") {
      const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&client_id=${UNSPLASH_KEY}`);
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
