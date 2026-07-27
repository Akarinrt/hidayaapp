import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { password } = await req.json();
    
    // Đọc mật khẩu từ biến môi trường
    const correctPassword = process.env.APP_PASSWORD || "hidaya123";

    if (password === correctPassword) {
      // Đăng nhập thành công, tạo response
      const response = NextResponse.json({ success: true });
      
      // Đặt Cookie có tên 'auth_session', sống trong 30 ngày (2592000 giây)
      response.cookies.set({
        name: 'auth_session',
        value: 'authenticated_hidaya',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: "Sai mật khẩu!" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống!" },
      { status: 500 }
    );
  }
}
