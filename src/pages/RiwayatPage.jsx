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

  // -- STATE PAGINATION & SEARCH --
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset ke hal 1 saat mencari
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Data
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("transactions")
        .select(`*, products ( name, category, image_url )`, { count: "exact" })
        .order("date", { ascending: false })
        .range(from, to);

      if (debouncedSearch) {
        query = query.ilike("product_name_cached", `%${debouncedSearch}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setTransactions(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetch history:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage, debouncedSearch]);

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`*, products(name, category)`)
        .order("date", { ascending: false }); // Ambil SEMUA data

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Tidak ada data untuk diexport");
        return;
      }

      // Format CSV Header
      const csvRows = [];
      csvRows.push(
        ["Tanggal", "Nama Barang", "Kategori", "Tipe", "Jumlah", "Status"].join(
          ","
        )
      );

      // Format Data Rows
      data.forEach((item) => {
        const name =
          item.product_name_cached || item.products?.name || "Unknown";
        const category = item.category_cached || item.products?.category || "-";
        const date = new Date(item.date).toLocaleDateString("id-ID");

        csvRows.push(
          [
            `"${date}"`,
            `"${name}"`,
            `"${category}"`,
            item.type,
            item.quantity,
            `"${item.status}"`,
          ].join(",")
        );
      });

      // Download File
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Laporan_Riwayat_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengunduh laporan");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Logic UI Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <MainLayout>
      <Header />

      <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] justify-between">
        {/* Toolbar Responsive */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 bg-white rounded-2xl">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari Riwayat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={handleExport}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#00509d] text-white rounded-xl hover:bg-[#003f7d] transition shadow-sm font-medium"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            {/* <button className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#00509d] text-white rounded-xl hover:bg-[#003f7d] transition shadow-sm font-medium">
              <SlidersHorizontal size={18} />
              <span>Filter</span>
            </button> */}
          </div>
        </div>

        {/* CONTAINER TABEL UTAMA */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-4 md:p-6 overflow-hidden flex flex-col relative">
          {/* Scroll X Wrapper */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="min-w-[800px] h-full flex flex-col">
              {/* Header Tabel Sticky */}
              <div className="grid grid-cols-12 gap-4 text-white/70 text-sm font-medium mb-4 px-4 sticky top-0 bg-transparent z-10">
                <div className="col-span-4">Nama Barang</div>
                <div className="col-span-2">Tipe</div>
                <div className="col-span-2">Jumlah</div>
                <div className="col-span-2">Tanggal</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* List Data */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40 text-white">
                    <Loader2 className="animate-spin mr-2" /> Memuat data...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-white h-40">
                    <FileSearch
                      size={40}
                      className="text-white opacity-80 mb-2"
                    />
                    <p>
                      {searchQuery
                        ? "Data tidak ditemukan."
                        : "Belum ada riwayat."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-2">
                    {transactions.map((item) => {
                      const displayName =
                        item.products?.name ||
                        item.product_name_cached ||
                        "Unknown Item";
                      const displayCategory =
                        item.products?.category || item.category_cached || "-";
                      const displayImage =
                        item.products?.image_url || item.image_url_cached;
                      const isDeleted = !item.products;

                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-4 items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >
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
                                  className={`w-full h-full object-cover ${
                                    isDeleted ? "grayscale opacity-70" : ""
                                  }`}
                                />
                              ) : (
                                <span className="text-[10px] text-gray-500">
                                  Log
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4
                                className={`font-bold text-sm truncate ${
                                  isDeleted
                                    ? "text-gray-500 line-through"
                                    : "text-gray-800"
                                }`}
                              >
                                {displayName}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {displayCategory}
                              </p>
                            </div>
                          </div>

                          <div className="col-span-2">
                            {item.type === "IN" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-bold whitespace-nowrap">
                                <ArrowDownLeft size={12} /> Masuk
                              </span>
                            )}
                            {item.type === "OUT" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] md:text-xs font-bold whitespace-nowrap">
                                <ArrowUpRight size={12} /> Keluar
                              </span>
                            )}
                            {item.type === "ADJUSTMENT" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] md:text-xs font-bold whitespace-nowrap">
                                <RefreshCw size={12} /> Koreksi
                              </span>
                            )}
                            {item.type === "DELETE" && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] md:text-xs font-bold whitespace-nowrap">
                                <Trash2 size={12} /> Hapus
                              </span>
                            )}
                          </div>

                          <div className="col-span-2 font-bold text-gray-700 text-sm">
                            {item.quantity} pcs
                          </div>
                          <div className="col-span-2 text-sm text-gray-500">
                            {formatDate(item.date)}
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
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
          </div>
        </div>

        {/* --- PAGINATION CONTROLS (KEMBALI KE VERSI LAMA YANG BERFUNGSI) --- */}
        <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 shadow-sm mt-4">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <span className="text-center">
            Showing {totalItems === 0 ? 0 : startEntry} to {endEntry} of{" "}
            {totalItems} records
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-primary text-white rounded-lg text-xs flex items-center">
              Page {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage >= totalPages || isLoading}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RiwayatPage;
