import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX = 100;

const EXAMPLES = [
  "모종 시장 오늘 열렸네요 🌱",
  "버스 정류장에 고양이 있어요",
  "면사무소 점심시간 변경됐어요",
];

function Toast({ msg }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 fade-in">
      {msg}
    </div>
  );
}

export default function HanMadiPage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleSubmit() {
    if (!text.trim()) return;
    showToast("한마디가 등록됐어요 🌿");
    setTimeout(() => navigate("/home"), 1500);
  }

  return (
    <div className="min-h-screen bg-cream">
      {toast && <Toast msg={toast} />}

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-14 pb-3 bg-cream sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-ink text-xl font-light">←</button>
          <h1 className="text-base font-bold text-ink">오늘의 한마디</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="bg-maul text-ink text-sm font-bold px-4 py-1.5 rounded-full disabled:opacity-40"
        >
          등록
        </button>
      </header>

      <div className="px-4 space-y-4">
        {/* 입력 카드 */}
        <div className="bg-maul rounded-2xl p-4 fade-in">
          <textarea
            className="w-full bg-transparent resize-none text-ink placeholder-ink/40 text-base leading-relaxed outline-none"
            rows={5}
            maxLength={MAX}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="오늘 마을에서 본 것…"
            autoFocus
          />
          <div className="flex justify-end">
            <span className="text-xs text-ink/50 font-medium">{text.length} / {MAX}</span>
          </div>
        </div>

        {/* 예시 칩 */}
        <div>
          <p className="text-xs text-sub mb-2 px-1">예시를 눌러보세요</p>
          <div className="flex flex-col gap-2 fade-in-1">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setText(ex)}
                className="text-left bg-white rounded-2xl px-4 py-3 text-sm text-ink shadow-sm hover:bg-cream transition-colors border border-gray-100"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 음성 버튼 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 fade-in-2">
        <button
          onClick={() => showToast("음성 녹음 기능은 준비 중입니다")}
          className="w-14 h-14 bg-maul rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-maul-dark transition-colors"
        >
          🎤
        </button>
        <span className="text-xs text-sub">아이콘 누르고 말하기</span>
      </div>
    </div>
  );
}
