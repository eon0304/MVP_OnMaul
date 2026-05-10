import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import BoardPage from "./pages/Board/BoardPage";
import PostDetailPage from "./pages/Board/PostDetailPage";
import PostCreatePage from "./pages/Board/PostCreatePage";
import BusPage from "./pages/Bus/BusPage";
import BusStopPage from "./pages/Bus/BusStopPage";
import BusOnboarding from "./pages/Bus/BusOnboarding";
import AdminPage from "./pages/Admin/AdminPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import { getUser } from "./api/auth";
import { useEffect, useState } from "react";

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex z-50">
      {[
        { to: "/board", icon: "💬", label: "게시판" },
        { to: "/bus", icon: "🚌", label: "버스" },
        { to: "/admin", icon: "📅", label: "행정" },
      ].map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              isActive ? "text-blue-600 font-semibold" : "text-gray-500"
            }`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div className="pb-16 min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/board" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bus/onboarding" element={<BusOnboarding />} />
        <Route
          path="/board"
          element={<Layout><BoardPage /></Layout>}
        />
        <Route
          path="/board/:id"
          element={<Layout><PostDetailPage /></Layout>}
        />
        <Route
          path="/board/new"
          element={<Layout><PostCreatePage /></Layout>}
        />
        <Route
          path="/bus"
          element={<Layout><BusPage /></Layout>}
        />
        <Route
          path="/bus/:stopId"
          element={<Layout><BusStopPage /></Layout>}
        />
        <Route
          path="/admin"
          element={<Layout><AdminPage /></Layout>}
        />
      </Routes>
    </BrowserRouter>
  );
}
