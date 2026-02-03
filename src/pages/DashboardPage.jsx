import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Header from "../components/fragments/Header";
import { supabase } from "../lib/supabaseClient";
import {
  Package,
  Layers,
  ClipboardList,
  TrendingUp,
  Loader2,
  Download,
} from "lucide-react"; // Tambah icon Download

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
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("stock, name, category, image_url, created_at")
        .order("created_at", { ascending: false });

      if (prodError) throw prodError;

      const { count: transCount, error: transError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      if (transError) throw transError;

      const totalStockSum = products.reduce((acc, curr) => acc + curr.stock, 0);

      setStats({
        totalItems: products.length,
        totalStock: totalStockSum,
        totalHistory: transCount || 0,
      });

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

  // --- FITUR BARU: EXPORT STOK (Laporan Aset) ---
  const handleExportStok = async () => {
    try {
      // 1. Ambil SEMUA data barang
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true }); // Urutkan abjad biar rapi

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Tidak ada data barang untuk diexport.");
        return;
      }

      // 2. Buat Header CSV
      const csvRows = [];
      csvRows.push(
        [
          "No",
          "Nama Barang",
          "Kategori",
          "Stok Saat Ini",
          "Tanggal Masuk",
        ].join(","),
      );

      // 3. Isi Baris Data
      data.forEach((item, index) => {
        const date = new Date(item.created_at).toLocaleDateString("id-ID");
        csvRows.push(
          [
            index + 1,
            `"${item.name}"`, // Pakai kutip biar aman kalau ada koma di nama
            `"${item.category}"`,
            item.stock,
            `"${date}"`,
          ].join(","),
        );
      });

      // 4. Download File
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Laporan_Stok_Gudang_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error.message);
      alert("Gagal download laporan stok.");
    }
  };

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
        {/* Card 1 */}
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
          <Package
            className="absolute -right-4 -bottom-4 text-white/10"
            size={120}
          />
        </div>
        {/* Card 2 */}
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
        {/* Card 3 */}
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

      {/* --- KONTEN BAWAH --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Barang Baru Masuk
            </h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
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

        {/* --- Quick Action (UPDATE BUTTON) --- */}
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex flex-col justify-center items-center text-center bg-white">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <TrendingUp className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">
            Performa Gudang
          </h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Unduh laporan lengkap stok saat ini untuk keperluan audit atau
            rekapitulasi bulanan.
          </p>

          {/* TOMBOL YANG SUDAH DIUPDATE */}
          <button
            onClick={handleExportStok}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export Laporan Stok
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
