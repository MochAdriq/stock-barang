import React, { useState } from "react";
import {
  LayoutGrid,
  ShoppingBag,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Tambah ini

// Komponen Menu Item
const MenuLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick} // Tutup sidebar saat menu diklik (untuk HP)
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        isActive
          ? "bg-blue-50 text-primary border-l-4 border-primary"
          : "text-gray-500 hover:bg-gray-50 hover:text-primary"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-primary flex overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl md:shadow-none 
          transform transition-transform duration-300 ease-in-out md:transform-none md:translate-x-0 md:m-6 md:rounded-3xl md:flex md:flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="mb-10 px-2 flex justify-between items-center">
            <h1 className="text-lg font-bold text-dark">Gudang App</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <MenuLink
              to="/dashboard"
              icon={LayoutGrid}
              label="Beranda"
              onClick={() => setIsSidebarOpen(false)}
            />
            <MenuLink
              to="/barang"
              icon={ShoppingBag}
              label="Barang"
              onClick={() => setIsSidebarOpen(false)}
            />
            <MenuLink
              to="/riwayat"
              icon={ClipboardList}
              label="Riwayat"
              onClick={() => setIsSidebarOpen(false)}
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 w-full rounded-xl transition-colors font-medium"
            >
              <LogOut size={20} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden p-4 bg-primary flex items-center gap-3 text-white sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg">Menu Utama</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
