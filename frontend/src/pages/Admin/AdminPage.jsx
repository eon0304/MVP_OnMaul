import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { logEvent } from "../../api/client";
import { getUser } from "../../api/auth";

const NOTICE_CATEGORIES = [
  { value: "", label: "전체" },
  { value: "면사무소", label: "🏛️ 면사무소" },
  { value: "이장", label: "👤 이장" },
  { value: "자치회", label: "🤝 자치회" },
];

const EVENT_TYPES = {
  festival: { label: "🎉 축제·행사", color: "bg-pink-100 text-pink-700" },
  policy: { label: "📋 지원정책", color: "bg-blue-100 text-blue-700" },
  meeting: { label: "📅 회의·행정", color: "bg-gray-100 text-gray-700" },
};

function CalendarTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    logEvent("tab_view", { tab_name: "admin_calendar" });
    api.get("/admin/calendar", { params: { year: now.getFullYear(), month: now.getMonth() + 1 } })
      .then(r => setEvents(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">불러오는 중...</div>;

  return (
    <div className="p-4 space-y-3">
      <p className="text-sm font-medium text-gray-600">
        {now.getFullYear()}년 {now.getMonth() + 1}월 일정
      </p>
      {events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-gray-400 text-sm">이번 달 등록된 일정이 없어요</p>
        </div>
      ) : (
        events.map(ev => {
          const typeInfo = EVENT_TYPES[ev.event_type] || EVENT_TYPES.meeting;
          return (
            <div
              key={ev.id}
              className="card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => logEvent("schedule_clicked", { schedule_id: ev.id, schedule_type: ev.event_type })}
            >
              <div className="flex items-start gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{ev.title}</p>
                  {ev.description && <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ev.event_date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function NoticesTab() {
  const [notices, setNotices] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/notices", { params: category ? { category } : {} })
      .then(r => setNotices(r.data))
      .finally(() => setLoading(false));
  }, [category]);

  if (selected) {
    return (
      <div className="p-4">
        <button onClick={() => setSelected(null)} className="text-blue-600 text-sm mb-4 flex items-center gap-1">
          ← 목록으로
        </button>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{selected.category}</span>
          {selected.is_pinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌 고정</span>}
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.title}</h2>
        <p className="text-xs text-gray-400 mb-4">
          {selected.author_nickname} · {new Date(selected.created_at).toLocaleDateString("ko-KR")}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-3 pb-2 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {NOTICE_CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === c.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400">불러오는 중...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📢</p>
            <p className="text-gray-400 text-sm">등록된 공지사항이 없어요</p>
          </div>
        ) : (
          notices.map(n => (
            <div
              key={n.id}
              onClick={() => setSelected(n)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{n.category}</span>
                {n.is_pinned && <span className="text-xs text-yellow-600">📌</span>}
                <span className="text-xs text-gray-400 ml-auto">{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
              </div>
              <p className="font-medium text-gray-900 text-sm">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MeetingsTab() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    logEvent("council_tab_click");
    api.get("/admin/meetings")
      .then(r => setMeetings(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="p-4">
        <button onClick={() => setSelected(null)} className="text-blue-600 text-sm mb-4">← 목록으로</button>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.title}</h2>
        <p className="text-xs text-gray-400 mb-4">
          {selected.author_nickname} · 회의일: {new Date(selected.meeting_date).toLocaleDateString("ko-KR")}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {loading ? (
        <div className="text-center py-8 text-gray-400">불러오는 중...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-gray-400 text-sm">아직 등록된 회의록이 없어요</p>
          <p className="text-xs text-gray-400 mt-1">곧 업데이트 예정입니다</p>
        </div>
      ) : (
        meetings.map(m => (
          <div
            key={m.id}
            onClick={() => { logEvent("council_detail_open", { meeting_id: m.id }); setSelected(m); }}
            className="card cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="font-medium text-gray-900 text-sm">{m.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              회의일: {new Date(m.meeting_date).toLocaleDateString("ko-KR")} · {m.author_nickname}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    logEvent("tab_view", { tab_name: "admin" });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-blue-600">📅 행정 정보</h1>
        <p className="text-xs text-gray-400 mt-0.5">청산면 공지·일정·회의록</p>
      </header>

      <div className="flex bg-white border-b border-gray-200">
        {[
          { key: "calendar", label: "일정" },
          { key: "notices", label: "공지사항" },
          { key: "meetings", label: "회의록" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "notices" && <NoticesTab />}
      {activeTab === "meetings" && <MeetingsTab />}
    </div>
  );
}
