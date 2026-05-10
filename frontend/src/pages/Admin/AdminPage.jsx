import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { logEvent } from "../../api/client";

/* ─── 더미 데이터 ─── */
const TODAY = new Date(2026, 4, 8); // 2026-05-08 (금)

const DUMMY_SCHEDULE = [
  { id: 1, date: new Date(2026, 4, 8), time: "19:00", title: "마을회의", place: "마을회관", host: "자치회", agendas: 5 },
  { id: 2, date: new Date(2026, 4, 8), time: "14:00", title: "농약 안전교육", place: "면사무소 대회의실", host: "면사무소" },
  { id: 3, date: new Date(2026, 4, 9), time: "14:00", title: "농약 안전교육", place: "면사무소 대회의실", host: "면사무소" },
  { id: 4, date: new Date(2026, 4, 10), time: "09:00", title: "분리수거 합동의 날", place: "마을 곳곳", host: "자치회" },
  { id: 5, date: new Date(2026, 4, 12), time: "10:00", title: "마을 가로등 정비 회의", place: "마을회관", host: "이장" },
];

const HOST_COLOR = {
  자치회: "bg-[#FFE8E8] text-[#C0392B]",
  면사무소: "bg-[#F5C842] text-[#7A6A00]",
  이장: "bg-[#E8F4E8] text-[#2E7D32]",
};

/* ─── 주간 날짜 바 ─── */
const KO_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getWeekDates(base) {
  const dow = base.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - dow + i);
    return d;
  });
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function hasEvent(date) {
  return DUMMY_SCHEDULE.some(e => sameDay(e.date, date));
}

/* ─── 월 달력 ─── */
function MonthCalendar({ selectedDate, onSelect }) {
  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden fade-in">
      <div className="grid grid-cols-7 text-center text-xs text-sub py-2 border-b border-gray-100">
        {KO_DAYS.map(d => <span key={d} className="py-1">{d}</span>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, month, day);
          const isToday = sameDay(date, TODAY);
          const isSelected = selectedDate && sameDay(date, selectedDate);
          const hasDot = hasEvent(date);
          return (
            <button
              key={i}
              onClick={() => onSelect(date)}
              className="flex flex-col items-center py-2 relative"
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isSelected ? "bg-maul text-ink font-bold" :
                  isToday ? "bg-maul/30 text-ink font-bold" :
                  "text-ink"
                }`}
              >
                {day}
              </span>
              {hasDot && (
                <span className="w-1 h-1 rounded-full bg-maul mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 일정 카드 ─── */
function ScheduleCard({ ev, onClick }) {
  const colorClass = HOST_COLOR[ev.host] || "bg-gray-100 text-gray-700";
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colorClass}`}>
          {ev.host}
        </span>
        <span className="text-xs text-sub ml-auto">{ev.time}</span>
      </div>
      <p className="text-sm font-bold text-ink">{ev.title}</p>
      <p className="text-xs text-sub mt-1">📍 {ev.place}{ev.agendas ? ` · 안건 ${ev.agendas}건` : ""}</p>
    </button>
  );
}

/* ─── Toast ─── */
function Toast({ msg }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 fade-in">
      {msg}
    </div>
  );
}

/* ─── 주간 어젠다 뷰 ─── */
function WeekView({ onEventClick }) {
  const [selected, setSelected] = useState(TODAY);
  const weekDates = getWeekDates(TODAY);

  const daySchedules = (date) => DUMMY_SCHEDULE.filter(e => sameDay(e.date, date));

  return (
    <>
      {/* 주간 날짜 바 */}
      <div className="overflow-x-auto px-4 pb-3">
        <div className="flex gap-2 w-max">
          {weekDates.map((d, i) => {
            const isToday = sameDay(d, TODAY);
            const isSelected = sameDay(d, selected);
            const hasDot = hasEvent(d);
            return (
              <button
                key={i}
                onClick={() => setSelected(d)}
                className="flex flex-col items-center w-10"
              >
                <span className="text-xs text-sub mb-1">{KO_DAYS[d.getDay()]}</span>
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isSelected ? "bg-maul text-ink font-bold" :
                    isToday ? "bg-maul/30 text-ink" :
                    "text-ink"
                  }`}
                >
                  {d.getDate()}
                </span>
                {hasDot && <span className="w-1 h-1 rounded-full bg-maul mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택 날짜 일정 */}
      <div className="px-4 space-y-2 fade-in">
        <p className="text-xs text-sub font-medium">
          {selected.getMonth() + 1}월 {selected.getDate()}일 ({KO_DAYS[selected.getDay()]})
          {sameDay(selected, TODAY) ? " · 오늘" : ""}
        </p>
        {daySchedules(selected).length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sub text-sm shadow-sm">
            이 날은 등록된 일정이 없어요
          </div>
        ) : (
          daySchedules(selected).map(ev => (
            <ScheduleCard key={ev.id} ev={ev} onClick={() => onEventClick(ev)} />
          ))
        )}
      </div>
    </>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("schedule");
  const [calView, setCalView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    logEvent("tab_view", { tab_name: "admin" });
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleTabChange(t) {
    if (t === "notice") { navigate("/admin/notices?type=notice"); return; }
    if (t === "minutes") { navigate("/admin/notices?type=minutes"); return; }
    setTab("schedule");
  }

  function handleEventClick(ev) {
    navigate(`/admin/detail/${ev.id}`);
  }

  const monthSelected = selectedDate
    ? DUMMY_SCHEDULE.filter(e => sameDay(e.date, selectedDate))
    : [];

  return (
    <div className="min-h-screen bg-cream">
      {toast && <Toast msg={toast} />}

      {/* 헤더 */}
      <header className="px-5 pt-14 pb-3 flex items-center justify-between sticky top-0 bg-cream z-10">
        <h1 className="text-xl font-bold text-ink">행정</h1>
        <button onClick={() => showToast("다국어 지원 준비 중입니다")} className="text-xl">
          🌐
        </button>
      </header>

      {/* 상단 탭 */}
      <div className="px-4 mb-3">
        <div className="bg-white rounded-2xl flex overflow-hidden shadow-sm">
          {[
            { key: "schedule", label: "📅 일정" },
            { key: "notice",   label: "📢 공지" },
            { key: "minutes",  label: "📋 회의록" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t.key
                  ? "border-maul text-ink font-bold"
                  : "border-transparent text-sub"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 뷰 전환 토글 */}
      <div className="flex items-center justify-end px-5 mb-3">
        <button
          onClick={() => setCalView(v => v === "week" ? "month" : "week")}
          className="text-xs text-sub underline underline-offset-2"
        >
          {calView === "week" ? "월별로 보기 ›" : "주간으로 보기 ›"}
        </button>
      </div>

      {calView === "week" ? (
        <WeekView onEventClick={handleEventClick} />
      ) : (
        <>
          <MonthCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
          {selectedDate && (
            <div className="px-4 mt-4 space-y-2 fade-in">
              <p className="text-xs text-sub font-medium px-1">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
              </p>
              {monthSelected.length === 0 ? (
                <div className="bg-white rounded-2xl p-5 text-center text-sub text-sm shadow-sm">
                  이 날은 등록된 일정이 없어요
                </div>
              ) : (
                monthSelected.map(ev => (
                  <ScheduleCard key={ev.id} ev={ev} onClick={() => handleEventClick(ev)} />
                ))
              )}
            </div>
          )}
        </>
      )}

      <div className="h-8" />
    </div>
  );
}
