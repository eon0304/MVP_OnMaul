import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { logEvent } from "../../api/client";
import { getUser } from "../../api/auth";

function UserTypeBadge({ type }) {
  const map = { "이주민": "badge-immigrant", "주민": "badge-resident", "관리자": "badge-admin" };
  return <span className={map[type] || "badge-immigrant"}>{type}</span>;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(r => {
        setPost(r.data);
        logEvent("post_viewed", { post_id: Number(id), category: r.data.category });
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLike() {
    if (!user) return navigate("/login");
    const r = await api.post(`/posts/${id}/like`);
    setPost(p => ({ ...p, like_count: r.data.like_count, is_liked: r.data.liked }));
    logEvent("like_added", { post_id: Number(id) });
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/posts/${id}/comments`, { content: comment });
      setPost(p => ({ ...p, comments: [...p.comments, r.data] }));
      setComment("");
      logEvent("comment_created", { post_id: Number(id) });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">불러오는 중...</div>;
  if (!post) return <div className="p-8 text-center text-gray-400">게시글을 찾을 수 없습니다</div>;

  return (
    <div className="bg-white min-h-screen">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
      </header>

      <div className="px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h1>
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
          <UserTypeBadge type={post.author_type} />
          <span>{post.author_nickname}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
          <span>·</span>
          <span>👁 {post.view_count}</span>
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt="첨부 이미지"
            className="w-full rounded-xl mb-4 max-h-64 object-cover"
          />
        )}

        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

        <div className="flex items-center gap-4 py-3 border-t border-b border-gray-100 mb-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              post.is_liked ? "text-blue-600" : "text-gray-400 hover:text-blue-500"
            }`}
          >
            <span>{post.is_liked ? "👍" : "👍"}</span>
            <span>좋아요 {post.like_count}</span>
          </button>
          <span className="text-gray-400 text-sm">💬 댓글 {post.comments?.length || 0}</span>
        </div>

        <div className="space-y-3 mb-4">
          {(post.comments || []).map(c => (
            <div key={c.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserTypeBadge type={c.author_type} />
                <span className="text-xs font-medium text-gray-700">{c.author_nickname}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(c.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="text-sm text-gray-700">{c.content}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleComment} className="flex gap-2 sticky bottom-20 bg-white py-2">
            <input
              className="input flex-1"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              등록
            </button>
          </form>
        ) : (
          <div className="text-center py-4 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">댓글을 달려면 로그인이 필요해요</p>
            <button onClick={() => navigate("/login")} className="text-blue-600 text-sm font-medium">
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
