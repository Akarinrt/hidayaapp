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
    const isVideo = file && file.size > 0 && file.type.includes('video');

    if (isVideo) {
      // TRƯỜNG HỢP 1: ĐĂNG VIDEO
      const formData = new FormData();
      formData.append('description', content); // Video dùng description
      formData.append('access_token', ACCESS_TOKEN);
      formData.append('source', file);

      fbResponse = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/videos`, {
        method: 'POST',
        body: formData
      });
      fbData = await fbResponse.json();
    } else if ((file && file.size > 0) || imageUrl) {
      // TRƯỜNG HỢP 2: ĐĂNG ẢNH (ÉP TÁCH BÀI BẰNG CÁCH UPLOAD ẨN TRƯỚC)
      const photoFormData = new FormData();
      photoFormData.append('access_token', ACCESS_TOKEN);
      photoFormData.append('published', 'false'); // Không hiển thị trên Timeline ngay

      if (file && file.size > 0) {
        photoFormData.append('source', file);
      } else {
        photoFormData.append('url', imageUrl);
      }

      // 2.1 Upload ảnh ẩn
      const uploadRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
        method: 'POST',
        body: photoFormData
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        return NextResponse.json(
          { success: false, error: uploadData.error?.message || "Lỗi tải ảnh lên Facebook" },
          { status: uploadRes.status }
        );
      }

      // 2.2 Tạo bài viết Feed gắn ID ảnh vừa tải (để ép nó thành bài độc lập)
      const feedFormData = new FormData();
      feedFormData.append('access_token', ACCESS_TOKEN);
      feedFormData.append('message', content);
      feedFormData.append('attached_media', JSON.stringify([{ media_fbid: uploadData.id }]));

      fbResponse = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
        method: 'POST',
        body: feedFormData
      });
      fbData = await fbResponse.json();
    } else {
      // TRƯỜNG HỢP 3: CHỈ ĐĂNG TEXT
      const formData = new FormData();
      formData.append('message', content);
      formData.append('access_token', ACCESS_TOKEN);

      fbResponse = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
        method: 'POST',
        body: formData
      });
      fbData = await fbResponse.json();
    }

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
