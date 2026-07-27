import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content, platforms } = await request.json();

    // Chỉ chạy nếu user có chọn Facebook
    if (!platforms.facebook) {
      return NextResponse.json({ success: true, message: "Bỏ qua Facebook" });
    }

    const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!PAGE_ID || !ACCESS_TOKEN || PAGE_ID === "YOUR_PAGE_ID_HERE") {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình Token Facebook trong file .env.local" },
        { status: 400 }
      );
    }

    // Gọi Graph API của Facebook (Dùng me/feed thay vì truyền ID cứng để tránh lỗi sai ID)
    const fbResponse = await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        access_token: ACCESS_TOKEN,
      }),
    });

    const data = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error("Facebook API Error:", data);
      return NextResponse.json(
        { success: false, error: data.error?.message || "Lỗi từ Facebook API" },
        { status: fbResponse.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Đăng bài Facebook thành công!", 
      id: data.id 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống máy chủ" },
      { status: 500 }
    );
  }
}
