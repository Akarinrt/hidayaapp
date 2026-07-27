import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const reqData = await request.formData();
    const content = reqData.get('content');
    const platforms = JSON.parse(reqData.get('platforms') || '{}');
    const file = reqData.get('file');
    const imageUrl = reqData.get('imageUrl');

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
    let fbResponse;
    let fbData;

    // Phân loại: là Video hay là Ảnh
    let fbEndpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`;
    const formData = new FormData();
    formData.append('access_token', ACCESS_TOKEN);

    if (file && file.size > 0) {
      // File tải lên từ máy tính
      formData.append('source', file);
      
      if (file.type.includes('video')) {
        fbEndpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/videos`;
        formData.append('description', content); // Video dùng description
      } else {
        fbEndpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;
        formData.append('message', content);
      }
    } else if (imageUrl) {
      // Ảnh URL từ Unsplash
      formData.append('url', imageUrl);
      formData.append('message', content);
      fbEndpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;
    } else {
      // Chỉ đăng text
      formData.append('message', content);
    }

    const fbResponse = await fetch(fbEndpoint, {
      method: 'POST',
      body: formData
    });
    const fbData = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error("Facebook API Error:", fbData);
      return NextResponse.json(
        { success: false, error: fbData.error?.message || "Lỗi từ Facebook API" },
        { status: fbResponse.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Đăng bài Facebook thành công!", 
      id: fbData.id 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống máy chủ" },
      { status: 500 }
    );
  }
}
