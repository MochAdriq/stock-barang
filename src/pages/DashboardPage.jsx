import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Header from "../components/fragments/Header";
import { supabase } from "../lib/supabaseClient"; // Import Supabase
import {
  Package,
  Layers,
  ClipboardList,
  TrendingUp,
  Loader2,
} from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    totalHistory: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi Fetch Data Dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil Semua Produk (Untuk hitung total jenis & total stok)
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("stock, name, category, image_url, created_at")
        .order("created_at", { ascending: false }); // Urutkan terbaru

      if (prodError) throw prodError;

      // 2. Ambil Jumlah Transaksi (Hanya butuh jumlahnya/count)
      const { count: transCount, error: transError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      if (transError) throw transError;

      // 3. Hitung Manual Total Stok (Looping jumlahan)
      const totalStockSum = products.reduce((acc, curr) => acc + curr.stock, 0);

      // 4. Update State
      setStats({
        totalItems: products.length,
        totalStock: totalStockSum,
        totalHistory: transCount || 0,
      });

      // Ambil 5 barang paling baru untuk tabel preview
      setRecentItems(products.slice(0, 5));
    } catch (error) {
      console.error("Error dashboard:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format Tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <Header />

      {/* --- KARTU STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Jenis Barang */}
        <div className="bg-blue-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-200">
          <div className="relative z-10">
            <div className="p-3 bg-white/20 w-fit rounded-xl mb-4 backdrop-blur-sm">
              <Package size={24} className="text-white" />
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Total Jenis Barang
            </p>
            <h3 className="text-3xl font-bold">
              {isLoading ? "..." : stats.totalItems}
            </h3>
          </div>
          {/* Hiasan Background */}
          <Package
            className="absolute -right-4 -bottom-4 text-white/10"
            size={120}
          />
        </div>

        {/* Card 2: Total Stok Fisik */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="p-3 bg-orange-50 w-fit rounded-xl mb-4">
              <Layers size={24} className="text-orange-500" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Stok Fisik
            </p>
            <h3 className="text-3xl font-bold text-gray-800">
              {isLoading ? "..." : stats.totalStock}{" "}
              <span className="text-sm font-normal text-gray-400">pcs</span>
            </h3>
          </div>
        </div>

        {/* Card 3: Total Riwayat Transaksi */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="p-3 bg-purple-50 w-fit rounded-xl mb-4">
              <ClipboardList size={24} className="text-purple-500" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Riwayat Transaksi
            </p>
            <h3 className="text-3xl font-bold text-gray-800">
              {isLoading ? "..." : stats.totalHistory}{" "}
              <span className="text-sm font-normal text-gray-400">kali</span>
            </h3>
          </div>
        </div>
      </div>

      {/* --- KONTEN BAWAH (TABEL SUMMARY) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bagian Kiri: Tabel Barang Terbaru (Lebar 2 kolom) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Barang Baru Masuk
            </h3>
            <button className="text-sm text-primary hover:underline font-medium">
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 font-medium">Barang</th>
                  <th className="py-3 font-medium">Kategori</th>
                  <th className="py-3 font-medium">Tanggal</th>
                  <th className="py-3 font-medium text-right">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <Loader2 className="animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : recentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-400">
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  recentItems.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                Img
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-700 text-sm group-hover:text-primary transition">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="py-3 text-sm text-gray-400">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 text-sm font-bold text-gray-800 text-right">
                        {item.stock}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bagian Kanan: Quick Action / Summary Kecil (Lebar 1 kolom) */}
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <TrendingUp className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">
            Performa Gudang
          </h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Semua data stok terupdate secara realtime. Cek riwayat untuk detail
            mutasi.
          </p>
          <button className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition shadow-lg shadow-blue-200">
            Unduh Laporan PDF
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
