import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { GlassHeader } from "@/components/ui";
import HomePage from "@/routes/HomePage";
import DashboardPage from "@/routes/DashboardPage";
import HistorialPage from "@/routes/HistorialPage";
import LoginPage from "@/routes/LoginPage";
import NuevoTrabajoPage from "@/routes/NuevoTrabajoPage";
import RecordatoriosPage from "@/routes/RecordatoriosPage";
import TrabajoDetallePage from "@/routes/TrabajoDetallePage";

function AppShell() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!isLogin && <GlassHeader title="Mi Taller · v1.1.5" />}

      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/historial" element={<HistorialPage />} />
              <Route path="/recordatorios" element={<RecordatoriosPage />} />
              <Route path="/trabajos/nuevo" element={<NuevoTrabajoPage />} />
              <Route path="/trabajos/:id" element={<TrabajoDetallePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
