import { NextResponse } from 'next/server';

export function middleware(request) {
  // Lấy danh sách các trang không cần đăng nhập
  const publicPaths = ['/login', '/api/auth', '/logo.jpg'];
  const path = request.nextUrl.pathname;

  // Bỏ qua các file tĩnh (CSS, JS, Hình ảnh Next.js)
  if (path.startsWith('/_next') || path.includes('.')) {
    return NextResponse.next();
  }

  // Nếu người dùng truy cập trang công khai thì cho qua
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Kiểm tra Cookie đăng nhập
  const token = request.cookies.get('auth_session')?.value;

  // Nếu không có Token (chưa đăng nhập), chuyển hướng về trang /login
  if (!token || token !== 'authenticated_hidaya') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Cấu hình Middleware chỉ chạy trên các trang cần thiết
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
