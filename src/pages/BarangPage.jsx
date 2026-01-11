import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // 1. Import Supabase
import MainLayout from "../layouts/MainLayout";
import Header from "../components/fragments/Header";
import Button from "../components/ui/Button";
import AddStockModal from "../components/fragments/AddStockModal";
import DeleteAlert from "../components/fragments/DeleteAlert";
import DetailModal from "../components/fragments/DetailModal";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const BarangPage = () => {
  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State Data Selection
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToDetail, setItemToDetail] = useState(null);

  // 2. STATE DATA ASLI (Ganti dummyBarang)
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. FUNGSI FETCH DATA DARI SUPABASE
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Ambil data dari tabel 'products', urutkan dari yang terbaru
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      alert("Gagal mengambil data barang!");
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetchProducts saat halaman pertama kali dibuka
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Handlers ---
  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // 1. (BARU) Catat dulu ke Riwayat sebelum dihapus
      // Kita pakai nama dari itemToDelete karena setelah ini ID-nya akan invalid
      await supabase.from("transactions").insert([
        {
          product_id: null, // ID null karena barangnya mau dihapus
          product_name_cached: itemToDelete.name, // PENTING: Nama disimpan di sini
          type: "DELETE",
          quantity: itemToDelete.stock, // Catat stok terakhir saat dihapus
          date: new Date(),
          status: "Barang Dihapus",
        },
      ]);

      // 2. Hapus data dari tabel 'products'
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      fetchProducts();
      setIsDeleteOpen(false);
      setItemToDelete(null);
      alert(`Berhasil menghapus ${itemToDelete.name}`);
    } catch (error) {
      console.error("Gagal menghapus:", error.message);
      alert("Gagal menghapus barang!");
    }
  };

  const handleOpenDetail = (item) => {
    setItemToDetail(item);
    setIsDetailOpen(true);
  };

  // Helper: Format Tanggal (dari 2025-12-20T... jadi 20 Desember 2025)
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <MainLayout>
      <Header />

      {isModalOpen && (
        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editData={itemToEdit}
          onSuccess={fetchProducts}
        />
      )}

      <DeleteAlert
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || "Item ini"}
      />

      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={itemToDetail}
      />

      {/* Card Utama */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari Barang"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark"
            >
              <Plus size={18} />
              <span>Tambah Barang</span>
            </Button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition">
              <SlidersHorizontal size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="py-4 px-4 font-medium min-w-[200px]">
                  Nama Barang
                </th>
                <th className="py-4 px-4 font-medium">Gambar</th>
                <th className="py-4 px-4 font-medium">Kategori</th>
                <th className="py-4 px-4 font-medium">Tanggal</th>
                <th className="py-4 px-4 font-medium">Stock Barang</th>
                <th className="py-4 px-4 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* 4. LOADING STATE */}
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2
                        className="animate-spin text-primary"
                        size={30}
                      />
                      <p>Memuat data barang...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                /* 5. EMPTY STATE (Jika data kosong) */
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">
                    Belum ada data barang. Silakan tambah barang baru.
                  </td>
                </tr>
              ) : (
                /* 6. MAPPING DATA ASLI */
                products.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="py-4 px-4 font-medium text-dark">
                      {item.name}
                    </td>

                    {/* Kolom Gambar */}
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400">Img</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-600">{item.category}</td>

                    {/* Format Tanggal */}
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Format Stok */}
                    <td className="py-4 px-4 font-medium text-dark">
                      {item.stock} pcs
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Tetap Statis Dulu) */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          {/* ... Bagian ini biarkan dulu, kita fokus data tampil dulu ... */}
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select className="border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-primary">
              <option>10</option>
            </select>
          </div>
          <span>Showing {products.length} records</span>
          <div className="flex gap-1">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
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

export default BarangPage;
