import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/board");
    } catch (err) {
      setError(err.response?.data?.detail || "로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">온마을</h1>
        <p className="text-gray-500 text-sm mt-1">청산면 이주민 커뮤니티</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">아이디</label>
          <input
            className="input"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="아이디를 입력하세요"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">비밀번호</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        계정이 없으신가요?{" "}
        <Link to="/register" className="text-blue-600 font-medium">회원가입</Link>
      </p>
    </div>
  );
}
