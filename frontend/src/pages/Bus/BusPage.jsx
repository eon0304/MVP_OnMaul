import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { logEvent } from "../../api/client";
import { getUser } from "../../api/auth";

const ROUTE_COLORS = {
  "#2E75B6": "bg-blue-600",
  "#5BA4CF": "bg-blue-400",
  "#70AD47": "bg-green-500",
  "#ED7D31": "bg-orange-400",
};

export default function BusPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState("stops");
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    logEvent("bus_tab_open");
    if (user?.userType === "이주민" && !localStorage.getItem("bus_onboarding_done")) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    Promise.all([api.get("/bus/stops"), api.get("/bus/routes")])
      .then(([s, r]) => { setStops(s.data); setRoutes(r.data); })
      .finally(() => setLoading(false));
  }, []);

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-white flex flex-col px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">어디 가고 싶으세요?</h1>
          <button
            onClick={() => {
              logEvent("onboarding_bus_skip");
              localStorage.setItem("bus_onboarding_done", "1");
              setShowOnboarding(false);
            }}
            className="text-sm text-gray-400"
          >
            건너뛰기
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">처음 청산면에 오셨군요 👋<br/>목적지를 탭하면 버스 정보를 알려드려요</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "🏙️", label: "옥천읍", desc: "장보기·병원", route: "541·503번", duration: "약 40분", count: "하루 4회" },
            { icon: "🏥", label: "병원", desc: "옥천보건소·성모병원", route: "541번→도보", duration: "약 45분", count: "하루 4회" },
            { icon: "🚉", label: "대전", desc: "환승 포함", route: "541→시외버스", duration: "약 1시간 20분", count: "환승 필요" },
            { icon: "🌲", label: "보은", desc: "보은 방면", route: "610번", duration: "약 50분", count: "하루 5회" },
          ].map(card => (
            <button
              key={card.label}
              onClick={() => {
                logEvent("onboarding_bus_complete", { destination_card: card.label });
                localStorage.setItem("bus_onboarding_done", "1");
                setShowOnboarding(false);
              }}
              className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left hover:bg-blue-100 transition-colors"
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <div className="font-bold text-gray-900 text-sm">{card.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.desc}</div>
              <div className="mt-2 pt-2 border-t border-blue-100">
                <div className="text-xs text-blue-700 font-medium">{card.route}</div>
                <div className="text-xs text-gray-500">{card.duration} · {card.count}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">청산주차장 출발 기준 안내입니다</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-blue-600">🚌 버스 정보</h1>
        <p className="text-xs text-gray-400 mt-0.5">청산면 버스 시간표</p>
      </header>

      <div className="flex bg-white border-b border-gray-200">
        {[
          { key: "stops", label: "정류장" },
          { key: "routes", label: "노선도" },
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

      {loading ? (
        <div className="p-8 text-center text-gray-400">불러오는 중...</div>
      ) : activeTab === "stops" ? (
        <div className="p-4 space-y-2">
          {stops.map(stop => (
            <button
              key={stop.id}
              onClick={() => { logEvent("stop_viewed", { stop_id: stop.id }); navigate(`/bus/${stop.id}`); }}
              className="w-full card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stop.is_main ? "🚏" : "📍"}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">{stop.name}</div>
                  {stop.is_main && <div className="text-xs text-blue-600">주요 정류장</div>}
                </div>
              </div>
              <span className="text-gray-400 text-lg">→</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {routes.map(route => (
            <div key={route.number} className="card">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: route.color }}
                >
                  {route.number}
                </span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{route.name}</div>
                  <div className="text-xs text-gray-500">{route.duration}{route.daily_count ? ` · 하루 ${route.daily_count}회` : ""}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {route.stops.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 shrink-0">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap">{s}</span>
                    {i < route.stops.length - 1 && <span className="text-gray-400 text-xs">→</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
