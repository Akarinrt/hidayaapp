"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const t = {
  vi: {
    subtitle: "Hệ thống Quản lý Nội dung",
    passwordLabel: "Mật khẩu truy cập",
    placeholder: "Nhập mật khẩu...",
    loginBtn: "Đăng nhập hệ thống",
    loadingBtn: "Đang xác thực...",
    securityText: "Bảo mật cấp cao dành riêng cho nội bộ HIDAYA.",
    errorNetwork: "Không thể kết nối máy chủ"
  },
  en: {
    subtitle: "Content Management System",
    passwordLabel: "Access Password",
    placeholder: "Enter password...",
    loginBtn: "Login to System",
    loadingBtn: "Authenticating...",
    securityText: "High-level security exclusively for HIDAYA staff.",
    errorNetwork: "Cannot connect to server"
  }
};

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('vi');
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
      setError(t[lang].errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      {/* Nút chọn ngôn ngữ */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border">
        <button 
          onClick={() => setLang('vi')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'vi' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          VN
        </button>
        <button 
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          EN
        </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-blue-600">
          <div className="bg-white p-3 rounded-full inline-block mb-4 shadow-lg">
            <img src="/logo.jpg" alt="Hidaya Logo" className="w-16 h-16 rounded-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white">HIDAYA Travel</h2>
          <p className="text-blue-100 mt-1">{t[lang].subtitle}</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">{t[lang].passwordLabel}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 font-medium"
              placeholder={t[lang].placeholder}
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
            {loading ? t[lang].loadingBtn : t[lang].loginBtn}
          </button>
          
          <p className="text-center text-gray-400 text-xs mt-6">
            {t[lang].securityText}
          </p>
        </form>
      </div>
    </div>
  );
}
