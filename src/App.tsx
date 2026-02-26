import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { GlassHeader } from "@/components/ui";
import DashboardPage from "@/routes/DashboardPage";
import HistorialPage from "@/routes/HistorialPage";
import LoginPage from "@/routes/LoginPage";
import NuevoTrabajoPage from "@/routes/NuevoTrabajoPage";
import TrabajoDetallePage from "@/routes/TrabajoDetallePage";

function AppShell() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!isLogin && <GlassHeader title="Mi Taller · v1.2.0" />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/trabajos/nuevo" element={<NuevoTrabajoPage />} />
          <Route path="/trabajos/:id" element={<TrabajoDetallePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
