import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { logEvent } from "../../api/client";
import { getUser } from "../../api/auth";

const CATEGORIES = [
  { value: "농사정보", label: "🌾 농사정보" },
  { value: "지역용어관습", label: "📖 지역용어·관습" },
  { value: "오늘내이야기", label: "☀️ 오늘 내 이야기" },
  { value: "질문과답변", label: "❓ 질문과 답변" },
  { value: "마을사진", label: "📷 마을사진" },
  { value: "마을소식", label: "📢 마을소식" },
];

export default function PostCreatePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [form, setForm] = useState({ title: "", content: "", category: "질문과답변" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("category", form.category);
      if (image) fd.append("image", image);
      const r = await api.post("/posts", fd, { headers: { "Content-Type": "multipart/form-data" } });
      logEvent("post_created", { category: form.category, has_photo: !!image });
      if (image) logEvent("post_type_photo", { post_id: r.data.id });
      else logEvent("post_type_text", { post_id: r.data.id });
      navigate(`/board/${r.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "등록 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <h1 className="text-base font-bold text-gray-900">글쓰기</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">카테고리</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: c.value }))}
                className={`p-2.5 rounded-lg border text-sm text-left transition-colors ${
                  form.category === c.value
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">제목</label>
          <input
            className="input"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="제목을 입력하세요 (최대 50자)"
            maxLength={50}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">내용</label>
          <textarea
            className="input resize-none"
            rows={7}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="내용을 입력하세요 (최대 2,000자)"
            maxLength={2000}
            required
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.content.length}/2000</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">사진 첨부 (선택)</label>
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-2xl">📷</span>
            <span className="text-sm text-gray-500">사진을 선택하세요</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {preview && (
            <div className="mt-2 relative">
              <img src={preview} alt="미리보기" className="w-full h-40 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
