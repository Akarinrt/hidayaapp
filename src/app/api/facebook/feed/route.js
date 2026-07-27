import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!PAGE_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình Token Facebook" },
        { status: 400 }
      );
    }

    // Lấy thông tin Fanpage (Cover, Avatar, Name, About)
    const infoRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,about,followers_count,picture.type(large),cover&access_token=${ACCESS_TOKEN}`);
    const pageInfo = await infoRes.json();

    // Lấy danh sách bài viết (Có thêm full_picture để lấy ảnh bài đăng)
    const fbResponse = await fetch(`https://graph.facebook.com/v19.0/me/posts?fields=id,message,created_time,full_picture&access_token=${ACCESS_TOKEN}`);
    const data = await fbResponse.json();

    if (!fbResponse.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || "Lỗi API" },
        { status: fbResponse.status }
      );
    }

    return NextResponse.json({ success: true, pageInfo: pageInfo, posts: data.data || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
