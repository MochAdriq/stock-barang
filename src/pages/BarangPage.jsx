import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToDetail, setItemToDetail] = useState(null);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      // FILTER SEARCH
      if (debouncedSearch) {
        query = query.ilike("name", `%${debouncedSearch}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setProducts(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      alert("Gagal mengambil data barang!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage, debouncedSearch]);

  // --- Handlers ---
  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };
  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };
  const handleOpenDetail = (item) => {
    setItemToDetail(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      // Catat ke riwayat
      await supabase.from("transactions").insert([
        {
          product_id: null,
          product_name_cached: itemToDelete.name,
          category_cached: itemToDelete.category,
          image_url_cached: itemToDelete.image_url,
          type: "DELETE",
          quantity: itemToDelete.stock,
          date: new Date(),
          status: "Barang Dihapus",
        },
      ]);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", itemToDelete.id);
      if (error) throw error;

      setCurrentPage(1);
      fetchProducts();
      setIsDeleteOpen(false);
      setItemToDelete(null);
      alert(`Berhasil menghapus ${itemToDelete.name}`);
    } catch (error) {
      console.error("Gagal menghapus:", error.message);
      alert("Gagal menghapus barang!");
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <MainLayout>
      <Header />

      {isModalOpen && (
        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editData={itemToEdit}
          onSuccess={() => {
            setCurrentPage(1);
            fetchProducts();
          }}
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

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari Barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
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
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
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
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">
                    {searchQuery
                      ? "Barang tidak ditemukan."
                      : "Belum ada data barang."}
                  </td>
                </tr>
              ) : (
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
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {formatDate(item.created_at)}
                    </td>
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

        {/* --- PAGINATION CONTROLS --- */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
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
          <span>
            Showing {totalItems === 0 ? 0 : startEntry} to {endEntry} of{" "}
            {totalItems} records
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BarangPage;
