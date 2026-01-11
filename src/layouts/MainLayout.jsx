import React from "react";
import { LayoutGrid, ShoppingBag, ClipboardList, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// --- PERBAIKAN: Komponen dipindah ke LUAR MainLayout ---
const MenuLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  // Cek apakah link ini sedang aktif
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        isActive
          ? "bg-blue-50 text-primary border-l-4 border-primary" // Style Aktif
          : "text-gray-500 hover:bg-gray-50 hover:text-primary"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

// --- Main Layout Utama ---
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-primary p-4 md:p-6 flex gap-6">
      {/* SIDEBAR (Floating Card) */}
      <aside className="w-64 bg-white rounded-3xl shadow-lg flex flex-col p-6 h-[calc(100vh-3rem)] sticky top-6">
        {/* Logo Text */}
        <div className="mb-10 px-2">
          <h1 className="text-lg font-bold text-dark">
            PT Sentral Layanan Prima
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-2">
          <MenuLink to="/dashboard" icon={LayoutGrid} label="Beranda" />
          <MenuLink to="/barang" icon={ShoppingBag} label="Barang" />
          <MenuLink to="/riwayat" icon={ClipboardList} label="Riwayat" />
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <button className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 w-full rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
