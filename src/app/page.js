"use client"
import { useState, useEffect } from 'react';
import { Facebook, Instagram, Video, Wand2, Send, Image as ImageIcon, Smile, Hash, AlertCircle, Globe, LayoutDashboard, PenSquare, ThumbsUp, MessageCircle, Clock } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

// --- BỘ TỪ ĐIỂN ĐA NGÔN NGỮ (i18n) ---
const t = {
  vi: {
    appName: "Quản lý HIDAYA travel",
    composeTab: "Soạn bài viết",
    manageTab: "Quản lý Fanpage",
    aiGenerate: "AI Viết bài",
    aiGenerating: "AI đang viết...",
    placeholder: "Bạn đang nghĩ gì? Hãy chia sẻ nội dung hoặc dùng AI...",
    addImage: "Thêm Ảnh",
    addVideo: "Thêm Video",
    selectPlatform: "CHỌN NỀN TẢNG",
    postNow: "ĐĂNG BÀI NGAY",
    recentPosts: "Bài viết gần đây trên Fanpage",
    likes: "Thích",
    comments: "Bình luận",
    noPosts: "Chưa có bài viết nào hoặc đang tải dữ liệu...",
    errorEmpty: "Vui lòng gõ vài từ khóa trước khi dùng AI!",
    errorPlatform: "Vui lòng chọn nền tảng để đăng!",
    postSuccess: "Đăng bài thành công!",
    followers: "người theo dõi",
    loadingFollowers: "Đang tải người theo dõi...",
    editPage: "Chỉnh sửa Trang",
    loadingPageInfo: "Đang tải thông tin Fanpage...",
    mediaOnly: "[Chỉ có Hình ảnh/Video]",
    loadingPosts: "Đang tải dữ liệu bài viết..."
  },
  en: {
    appName: "HIDAYA Travel Manager",
    composeTab: "Compose Post",
    manageTab: "Manage Fanpage",
    aiGenerate: "AI Generate",
    aiGenerating: "Generating...",
    placeholder: "What's on your mind? Share content or use AI...",
    addImage: "Add Image",
    addVideo: "Add Video",
    selectPlatform: "SELECT PLATFORM",
    postNow: "POST NOW",
    recentPosts: "Recent Posts on Fanpage",
    likes: "Likes",
    comments: "Comments",
    noPosts: "No posts found or still loading...",
    errorEmpty: "Please enter some keywords before using AI!",
    errorPlatform: "Please select a platform to post!",
    postSuccess: "Posted successfully!",
    followers: "followers",
    loadingFollowers: "Loading followers...",
    editPage: "Edit Page",
    loadingPageInfo: "Loading Fanpage info...",
    mediaOnly: "[Media Only]",
    loadingPosts: "Loading posts data..."
  }
};

export default function Dashboard() {
  const [lang, setLang] = useState('vi');
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'manage'
  
  // States cho Soạn bài
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [platforms, setPlatforms] = useState({ facebook: true, instagram: false, tiktok: false });
  const [status, setStatus] = useState(null);

  // States cho Quản lý Fanpage
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [pageError, setPageError] = useState(null);

  // Lấy danh sách bài viết khi chuyển sang tab Quản lý
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    setPageError(null);
    try {
      const res = await fetch('/api/facebook/feed');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
        setPageInfo(data.pageInfo);
      } else {
        setPageError(data.error || "Lỗi không xác định từ Server");
      }
    } catch (err) {
      console.error(err);
      setPageError("Lỗi kết nối mạng hoặc API");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!content.trim()) {
      setStatus({ type: 'error', message: t[lang].errorEmpty });
      return;
    }
    
    setIsGenerating(true);
    setStatus({ type: 'loading', message: t[lang].aiGenerating });
    
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: content })
      });
      const data = await res.json();
      
      if (data.success) {
        setContent(data.content);
        if (data.imageUrl) setImageUrl(data.imageUrl);
        setStatus({ type: 'success', message: '✨ Xong!' });
      } else {
        setStatus({ type: 'error', message: `❌ Lỗi: ${data.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: '❌ Lỗi kết nối API!' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async () => {
    const selectedPlatforms = Object.entries(platforms).filter(([_, isSelected]) => isSelected).map(([name]) => name);
    
    if (selectedPlatforms.length === 0) {
      setStatus({ type: 'error', message: t[lang].errorPlatform });
      return;
    }

    setStatus({ type: 'loading', message: 'Đang gửi...' });

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms })
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: `✅ ${t[lang].postSuccess}` });
        setContent('');
        setImageUrl('');
      } else {
        setStatus({ type: 'error', message: `❌ Lỗi: ${data.error}` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: '❌ Mất kết nối mạng!' });
    }
  };

  const togglePlatform = (platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* NAVBAR (MOBILE RESPONSIVE) */}
      <nav className="bg-white border-b px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-20 shadow-sm gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Globe size={22} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight">
            {t[lang].appName}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setLang('vi')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'vi' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            🇬🇧 English
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${activeTab === 'compose' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            <PenSquare size={18} />
            {t[lang].composeTab}
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard size={18} />
            {t[lang].manageTab}
          </button>
        </div>

        {/* TAB CONTENT: QUẢN LÝ FANPAGE */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            
            {pageError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 shadow-sm flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold">Lỗi tải dữ liệu Fanpage:</h4>
                  <p className="text-sm">{pageError}</p>
                  <p className="text-xs mt-2 opacity-80">Nếu nguyên nhân là "Lỗi API", khả năng cao Token của bạn đã hết hạn, hoặc là User Token chứ không phải Page Token. Nếu là "Chưa cấu hình Token", bạn cần kiểm tra lại file .env.local và Restart server.</p>
                </div>
              </div>
            )}

            {/* THÔNG TIN FANPAGE (PROFILE CARD) */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {isLoadingPosts ? (
                <div className="h-48 bg-gray-200 animate-pulse"></div>
              ) : pageInfo ? (
                <div>
                  {/* Cover Photo */}
                  <div 
                    className="h-48 sm:h-64 bg-gray-300 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${pageInfo.cover?.source || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200'})` }}
                  ></div>
                  
                  {/* Avatar & Info */}
                  <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12 mb-4">
                      <img 
                        src={pageInfo.picture?.data?.url || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white object-cover"
                      />
                      <div className="text-center sm:text-left pt-2 sm:pt-0">
                        <h2 className="text-2xl font-black text-gray-900">{pageInfo.name || "Fanpage Name"}</h2>
                        <p className="text-gray-500 font-medium mt-1">
                          {pageInfo.followers_count ? `${pageInfo.followers_count.toLocaleString()} ${t[lang].followers}` : t[lang].loadingFollowers}
                        </p>
                      </div>
                      <div className="sm:ml-auto mt-2 sm:mt-0">
                         <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
                            {t[lang].editPage}
                         </button>
                      </div>
                    </div>
                    {pageInfo.about && (
                      <div className="mt-4 text-gray-700 bg-gray-50 p-4 rounded-xl border">
                        <p>{pageInfo.about}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">{t[lang].loadingPageInfo}</div>
              )}
            </div>

            {/* DANH SÁCH BÀI VIẾT */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                <FaFacebook className="text-blue-600" />
                {t[lang].recentPosts}
              </h3>
              
              {isLoadingPosts ? (
                <div className="text-center py-10 text-gray-500 animate-pulse">{t[lang].loadingPosts}</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  {t[lang].noPosts}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map(post => (
                    <div key={post.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                      {post.full_picture && (
                        <div className="mb-4 -mx-5 -mt-5 h-48 overflow-hidden rounded-t-xl border-b bg-gray-100 flex items-center justify-center">
                          <img src={post.full_picture} alt="Post media" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-gray-800 mb-4 whitespace-pre-wrap line-clamp-4 flex-grow">{post.message || <span className="italic text-gray-400">{t[lang].mediaOnly}</span>}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t mt-auto">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><ThumbsUp size={16}/> {post.likes?.summary?.total_count || 0}</span>
                          <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><MessageCircle size={16}/> {post.comments?.summary?.total_count || 0}</span>
                        </div>
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(post.created_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: SOẠN BÀI (MOBILE RESPONSIVE GRID) */}
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Cột trái: Soạn thảo */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h2 className="text-lg font-bold text-gray-800">{t[lang].composeTab}</h2>
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} />
                    {isGenerating ? t[lang].aiGenerating : t[lang].aiGenerate}
                  </button>
                </div>
                
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t[lang].placeholder}
                  className="w-full h-48 sm:h-56 p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-base"
                ></textarea>

                {/* Attachments */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-semibold px-4 py-2 border rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto">
                    <ImageIcon size={18} /> {t[lang].addImage}
                  </button>
                  <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 font-semibold px-4 py-2 border rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto">
                    <Video size={18} /> {t[lang].addVideo}
                  </button>
                </div>
                
                {imageUrl && (
                  <div className="relative mt-4 rounded-xl overflow-hidden border bg-gray-100">
                    <img src={imageUrl} alt="AI Generated" className="w-full h-auto max-h-80 object-contain" />
                    <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-600 transition-colors">✕</button>
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải: Đăng bài */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
                <h3 className="font-black mb-4 text-gray-500 text-xs tracking-widest">{t[lang].selectPlatform}</h3>
                
                <div className="space-y-3">
                  {/* Facebook */}
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${platforms.facebook ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FaFacebook size={20} /></div>
                      <span className="font-bold text-gray-800">Facebook</span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" checked={platforms.facebook} onChange={() => togglePlatform('facebook')} />
                  </label>

                  {/* Instagram */}
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${platforms.instagram ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-100 p-2 rounded-lg text-pink-600"><FaInstagram size={20} /></div>
                      <span className="font-bold text-gray-800">Instagram</span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-pink-600 rounded" checked={platforms.instagram} onChange={() => togglePlatform('instagram')} />
                  </label>

                  {/* TikTok */}
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${platforms.tiktok ? 'border-gray-800 bg-gray-100 ring-2 ring-gray-300' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 p-2 rounded-lg text-gray-800"><FaTiktok size={20} /></div>
                      <span className="font-bold text-gray-800">TikTok</span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-gray-800 rounded" checked={platforms.tiktok} onChange={() => togglePlatform('tiktok')} />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
                {status && (
                  <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 text-sm font-medium ${
                    status.type === 'error' ? 'bg-red-50 text-red-700' : 
                    status.type === 'loading' ? 'bg-blue-50 text-blue-700' : 
                    'bg-green-50 text-green-700'
                  }`}>
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{status.message}</p>
                  </div>
                )}

                <button 
                  onClick={handlePost}
                  disabled={status?.type === 'loading'}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 tracking-wide disabled:opacity-50"
                >
                  <Send size={20} />
                  {t[lang].postNow}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
