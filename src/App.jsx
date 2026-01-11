import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BarangPage from "./pages/BarangPage";
import RiwayatPage from "./pages/RiwayatPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Import Pos Satpam

function App() {
  return (
    <Routes>
      {/* Route Public (Bisa diakses siapa saja) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Route Private (Harus Login Dulu) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/barang" element={<BarangPage />} />
        <Route path="/riwayat" element={<RiwayatPage />} />
      </Route>

      {/* Fallback kalau nyasar */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
