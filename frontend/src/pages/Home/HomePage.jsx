import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DUMMY = {
  nickname: "단풍나무",
  type: "새내기",
  date: "5월의 두 번째 화요일",
  greetingExample: "오늘 청산면 날씨 어떤가요? 🌤",
  stop: { name: "청산주차장", dist: "150m", next: "7분 후", line: "541번 옥천행" },
  schedule: [
    { date: "5/10", label: "마을회의" },
    { date: "5/12", label: "농약 안전교육" },
  ],
  posts: [
    { title: "청산면 귀농 1년차 후기 올려요", comments: 14 },
    { title: "주차장 버스 출발 시간 바뀌었나요?", comments: 8 },
  ],
};

export default function HomePage() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* 인삿말 헤더 */}
      <div className="px-5 pt-14 pb-4 fade-in">
        <p className="text-base text-sub">안녕하세요,</p>
        <h1 className="text-2xl font-bold text-ink mt-0.5">
          {DUMMY.nickname} 님 🌿
        </h1>
        <p className="text-xs text-sub mt-1">
          청산면 {DUMMY.type} · {DUMMY.date}
        </p>
      </div>

      {/* 위젯 카드 */}
      <div className="px-4 flex flex-col gap-3">
        {/* 오늘의 한마디 */}
        <div className="widget-card fade-in-1" onClick={() => navigate("/hanmadi")}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ink">오늘의 한마디</span>
            <span>✏️</span>
          </div>
          <div className="bg-cream rounded-xl px-3 py-2.5 text-sm text-sub/70">
            한 줄로 마을에 인사 남기기…
          </div>
          <p className="text-xs text-sub mt-2 italic">예: {DUMMY.greetingExample}</p>
        </div>

        {/* 가까운 정류장 */}
        <div
          className="widget-card fade-in-2"
          onClick={() => navigate("/bus/1")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-ink">가까운 정류장</span>
            <span className="text-xs text-sub">📍 {DUMMY.stop.dist}</span>
          </div>
          <p className="text-base font-semibold text-ink">{DUMMY.stop.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-maul text-ink text-xs font-bold px-2 py-0.5 rounded-full">
              {DUMMY.stop.next}
            </span>
            <span className="text-xs text-sub">{DUMMY.stop.line}</span>
          </div>
        </div>

        {/* 이번 주 일정 */}
        <div
          className="widget-card fade-in-3"
          onClick={() => navigate("/admin")}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ink">이번 주 일정</span>
            <span>📅</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {DUMMY.schedule.map(s => (
              <li key={s.date} className="flex items-center gap-2 text-sm text-ink">
                <span className="bg-cream text-sub text-xs font-semibold px-2 py-0.5 rounded-lg w-10 text-center">
                  {s.date}
                </span>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 인기 게시글 */}
        <div
          className="widget-card fade-in-4"
          onClick={() => navigate("/board")}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ink">인기 게시글</span>
            <span>🔥</span>
          </div>
          <ul className="flex flex-col gap-2">
            {DUMMY.posts.map((p, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink truncate flex-1">{p.title}</span>
                <span className="text-sub ml-2 text-xs whitespace-nowrap">
                  💬 {p.comments}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
