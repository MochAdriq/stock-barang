import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BarangPage from "./pages/BarangPage";
import RiwayatPage from "./pages/RiwayatPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/barang" element={<BarangPage />} />
      <Route path="/riwayat" element={<RiwayatPage />} />
    </Routes>
  );
}

export default App;
