import { useNavigate } from "react-router-dom";

export default function BusOnboarding() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center px-6 text-white">
      <div className="text-5xl mb-4">🚌</div>
      <h1 className="text-2xl font-bold mb-2">청산면 버스 안내</h1>
      <p className="text-blue-100 text-center text-sm mb-8">
        카카오맵에 없는 청산면 버스 정보를<br />목적지 중심으로 쉽게 찾아보세요
      </p>
      <button
        onClick={() => navigate("/bus")}
        className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-base"
      >
        버스 정보 보기
      </button>
    </div>
  );
}
