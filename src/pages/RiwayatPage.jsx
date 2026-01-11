import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Header from "../components/fragments/Header";
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const RiwayatPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data Riwayat + Relasi Nama Barang
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Join tabel transactions dengan products
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          products (
            name,
            category,
            image_url
          )
        `
        )
        .order("date", { ascending: false }); // Yang terbaru di atas

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error("Error fetch history:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Format Tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <Header />

      <div className="flex flex-col h-[calc(100vh-140px)] justify-between">
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari Riwayat"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#00509d] text-white rounded-xl hover:bg-[#003f7d] transition shadow-sm font-medium">
              <Download size={18} />
              <span>Export</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#00509d] text-white rounded-xl hover:bg-[#003f7d] transition shadow-sm font-medium">
              <SlidersHorizontal size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 overflow-hidden flex flex-col">
          {/* Header Tabel Transparan */}
          <div className="grid grid-cols-12 gap-4 text-white/70 text-sm font-medium mb-4 px-4">
            <div className="col-span-4">Nama Barang</div>
            <div className="col-span-2">Tipe</div>
            <div className="col-span-2">Jumlah</div>
            <div className="col-span-2">Tanggal</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-40 text-white">
                <Loader2 className="animate-spin mr-2" /> Memuat data...
              </div>
            ) : transactions.length === 0 ? (
              // EMPTY STATE
              <div className="flex flex-col items-center justify-center text-white h-full pb-10">
                <div className="bg-white/10 p-8 rounded-full mb-6 backdrop-blur-sm ring-1 ring-white/20">
                  <FileSearch size={80} className="text-white opacity-80" />
                </div>
                <h3 className="text-xl font-bold tracking-wide">
                  Belum ada riwayat.
                </h3>
                <p className="text-blue-100 text-sm mt-2">
                  Transaksi barang masuk/keluar akan muncul di sini.
                </p>
              </div>
            ) : (
              // LIST DATA
              <div className="space-y-3">
                {transactions.map((item) => {
                  // Logika Nama: Coba ambil dari relasi products dulu, kalau null (dihapus), ambil dari cached
                  const displayName =
                    item.products?.name ||
                    item.product_name_cached ||
                    "Unknown Item";
                  const displayCategory =
                    item.products?.category || "History Log";
                  const displayImage = item.products?.image_url;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      {/* Nama & Gambar */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${
                            displayImage ? "bg-gray-100" : "bg-gray-200"
                          }`}
                        >
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // Tampilkan inisial atau icon jika gambar hilang
                            <span className="text-xs font-bold text-gray-500">
                              Log
                            </span>
                          )}
                        </div>
                        <div>
                          <h4
                            className={`font-bold text-sm truncate ${
                              !item.products
                                ? "text-red-500 italic"
                                : "text-gray-800"
                            }`}
                          >
                            {displayName} {!item.products && "(Deleted)"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {displayCategory}
                          </p>
                        </div>
                      </div>

                      {/* Tipe Transaksi (Logic Warna Warni) */}
                      <div className="col-span-2">
                        {item.type === "IN" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            <ArrowDownLeft size={14} /> Masuk
                          </span>
                        )}
                        {item.type === "OUT" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                            <ArrowUpRight size={14} /> Keluar
                          </span>
                        )}
                        {item.type === "ADJUSTMENT" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            <RefreshCw size={14} /> Koreksi
                          </span>
                        )}
                        {item.type === "DELETE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                            <Trash2 size={14} /> Hapus
                          </span>
                        )}
                      </div>

                      {/* Jumlah */}
                      <div className="col-span-2 font-bold text-gray-700">
                        {item.type === "DELETE" ? "-" : `${item.quantity} pcs`}
                      </div>

                      {/* Tanggal */}
                      <div className="col-span-2 text-sm text-gray-500">
                        {formatDate(item.date)}
                      </div>

                      {/* Status Keterangan */}
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          {item.status || "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Pagination (Tetap Putih) */}
        <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 shadow-sm mt-4">
          {/* ... (Pagination Code Tetap Sama) ... */}
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select className="border border-gray-200 rounded-lg px-2 py-1">
              <option>10</option>
            </select>
          </div>
          <span>Showing {transactions.length} records</span>
          <div className="flex gap-1">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">
              1
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RiwayatPage;
