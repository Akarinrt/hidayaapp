"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-blue-600">
          <div className="bg-white p-3 rounded-full inline-block mb-4 shadow-lg">
            <img src="/logo.jpg" alt="Hidaya Logo" className="w-16 h-16 rounded-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white">HIDAYA Travel</h2>
          <p className="text-blue-100 mt-1">Hệ thống Quản lý Nội dung</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Mật khẩu truy cập</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 font-medium"
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100 font-medium">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>
          
          <p className="text-center text-gray-400 text-xs mt-6">
            Bảo mật cấp cao dành riêng cho nội bộ HIDAYA.
          </p>
        </form>
      </div>
    </div>
  );
}
