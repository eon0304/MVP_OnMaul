import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { logEvent } from "../../api/client";
import { getUser } from "../../api/auth";

function isNow(time) {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const dep = new Date(now);
  dep.setHours(h, m, 0, 0);
  return Math.abs(now - dep) <= 1200000; // ±20분
}

function isPast(time) {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const dep = new Date(now);
  dep.setHours(h, m, 0, 0);
  return now > dep;
}

function minutesUntil(time) {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const dep = new Date(now);
  dep.setHours(h, m, 0, 0);
  return Math.round((dep - now) / 60000);
}

export default function BusStopPage() {
  const { stopId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [stop, setStop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);

  useEffect(() => {
    api.get(`/bus/stops/${stopId}`)
      .then(r => setStop(r.data))
      .finally(() => setLoading(false));
  }, [stopId]);

  async function handleVote(scheduleId, isCorrect) {
    if (!user) return navigate("/login");
    setVoting(scheduleId);
    try {
      const r = await api.post(`/bus/schedules/${scheduleId}/vote`, { is_correct: isCorrect });
      setStop(s => ({
        ...s,
        schedules: s.schedules.map(sch =>
          sch.id === scheduleId
            ? { ...sch, vote_yes: r.data.vote_yes, vote_no: r.data.vote_no, my_vote: isCorrect }
            : sch
        ),
      }));
      logEvent(isCorrect ? "bus_vote_yes" : "bus_vote_no", { schedule_id: scheduleId, stop_id: Number(stopId) });
    } catch (err) {
      alert(err.response?.data?.detail || "투표 실패");
    } finally {
      setVoting(null);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">불러오는 중...</div>;
  if (!stop) return <div className="p-8 text-center text-gray-400">정류장을 찾을 수 없습니다</div>;

  const upcoming = stop.schedules.filter(s => !isPast(s.departure_time));
  const nextBus = upcoming[0];

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <div>
          <h1 className="text-base font-bold text-gray-900">🚏 {stop.name}</h1>
          {stop.code && <p className="text-xs text-gray-400">정류장 코드: {stop.code}</p>}
        </div>
      </header>

      {nextBus && (
        <div className="bg-blue-600 text-white px-4 py-4 text-center">
          <p className="text-xs opacity-80 mb-1">다음 버스</p>
          <p className="text-3xl font-bold">{minutesUntil(nextBus.departure_time)}분 후</p>
          <p className="text-sm opacity-90 mt-1">{nextBus.departure_time} · {nextBus.route_name}</p>
        </div>
      )}

      {!nextBus && (
        <div className="bg-gray-200 text-gray-600 px-4 py-4 text-center">
          <p className="text-sm">오늘 운행 종료</p>
        </div>
      )}

      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">오늘 시간표</h2>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
          {stop.schedules.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">등록된 시간표가 없습니다</p>
          ) : (
            stop.schedules.map((sch, i) => {
              const past = isPast(sch.departure_time);
              const canVote = isNow(sch.departure_time);
              const voted = sch.my_vote !== null && sch.my_vote !== undefined;
              return (
                <div
                  key={sch.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i > 0 ? "border-t border-gray-50" : ""
                  } ${past ? "opacity-50" : ""}`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: sch.color }}
                  />
                  <div className="flex-1">
                    <span className="font-mono text-sm font-medium text-gray-900">{sch.departure_time}</span>
                    <span className="text-xs text-gray-500 ml-2">{sch.route_number}번 {sch.direction && `→ ${sch.direction}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>✅{sch.vote_yes}</span>
                    <span>❌{sch.vote_no}</span>
                  </div>
                  {canVote && !voted && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleVote(sch.id, true)}
                        disabled={voting === sch.id}
                        className="w-9 h-9 rounded-lg bg-green-100 text-green-700 text-base hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => handleVote(sch.id, false)}
                        disabled={voting === sch.id}
                        className="w-9 h-9 rounded-lg bg-red-100 text-red-700 text-base hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        ❌
                      </button>
                    </div>
                  )}
                  {voted && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sch.my_vote ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {sch.my_vote ? "✅ 투표완료" : "❌ 투표완료"}
                    </span>
                  )}
                  {!canVote && !voted && past && (
                    <span className="text-xs text-gray-300">종료</span>
                  )}
                </div>
              );
            })
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          배차 시각 ±20분 이내에 O/X 투표로 실제 운행을 확인해요
        </p>
      </div>
    </div>
  );
}
