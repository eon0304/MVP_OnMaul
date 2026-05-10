import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { logEvent } from "../../api/client";
import { getUser, logout } from "../../api/auth";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "농사정보", label: "🌾 농사정보" },
  { value: "지역용어관습", label: "📖 지역용어" },
  { value: "오늘내이야기", label: "☀️ 오늘이야기" },
  { value: "질문과답변", label: "❓ 질문답변" },
  { value: "마을사진", label: "📷 마을사진" },
  { value: "마을소식", label: "📢 마을소식" },
];

function UserTypeBadge({ type }) {
  const map = { "이주민": "badge-immigrant", "주민": "badge-resident", "관리자": "badge-admin" };
  return <span className={map[type] || "badge-immigrant"}>{type}</span>;
}

function PostCard({ post }) {
  return (
    <Link to={`/board/${post.id}`} className="block card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
        <UserTypeBadge type={post.author_type} />
        <span className="text-xs text-gray-400 ml-auto">{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
      </div>
      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{post.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{post.author_nickname}</span>
        <span>👍 {post.like_count}</span>
        <span>💬 {post.comment_count}</span>
        <span>👁 {post.view_count}</span>
      </div>
    </Link>
  );
}

export default function BoardPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [category, setCategory] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logEvent("tab_view", { tab_name: "board" });
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/posts", { params: category ? { category } : {} })
      .then(r => setPosts(r.data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-blue-600">온마을 게시판</h1>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.nickname}</span>
            <button onClick={() => { logout(); navigate("/login"); }} className="text-xs text-gray-400">로그아웃</button>
          </div>
        ) : (
          <Link to="/login" className="text-sm text-blue-600 font-medium">로그인</Link>
        )}
      </header>

      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === c.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-3">이 카테고리의 첫 글을 작성해보세요</p>
            {user && (
              <button onClick={() => navigate("/board/new")} className="btn-outline text-sm px-4 py-2">
                글쓰기
              </button>
            )}
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {user && (
        <button
          onClick={() => navigate("/board/new")}
          className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          +
        </button>
      )}
    </div>
  );
}
