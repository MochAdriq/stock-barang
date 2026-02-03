import React, { useState, useEffect } from "react";
import { X, Paperclip, Calendar, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import Button from "../ui/Button";

const AddStockModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    stock: "",
    date: new Date().toISOString().split("T")[0],
  });

  // State untuk file gambar
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Mode Edit
        setFormData({
          category: editData.category || "",
          name: editData.name || "",
          stock: editData.stock
            ? editData.stock.toString().replace(" pcs", "")
            : "",
          date: editData.created_at ? editData.created_at.split("T")[0] : "",
        });
        setImagePreview(editData.image_url);
      } else {
        // Mode Tambah (Reset)
        setFormData({
          category: "",
          name: "",
          stock: "",
          date: new Date().toISOString().split("T")[0],
        });
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, editData]);

  // Handle Pilih File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Submit (Simpan ke Supabase)
  const handleSubmit = async () => {
    if (!formData.name || !formData.stock || !formData.category) {
      alert("Mohon lengkapi Nama, Kategori, dan Stok!");
      return;
    }

    setIsLoading(true);
    try {
      let publicUrl = editData?.image_url || null;

      // 1. Upload Gambar (Tetap sama)
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, "-")}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      let productId = editData?.id;
      let transactionPayload = null;

      if (editData) {
        // --- LOGIKA EDIT (ADJUSTMENT) ---
        const oldStock = parseInt(editData.stock || 0);
        const newStock = parseInt(formData.stock);
        const diff = newStock - oldStock;

        // Update Produk
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            category: formData.category,
            stock: newStock,
            image_url: publicUrl,
            created_at: formData.date,
          })
          .eq("id", editData.id);
        if (error) throw error;

        if (diff !== 0) {
          transactionPayload = {
            product_id: editData.id,
            product_name_cached: formData.name,
            category_cached: formData.category,
            image_url_cached: publicUrl,
            type: "ADJUSTMENT",
            quantity: Math.abs(diff),
            date: new Date(),
            status: diff > 0 ? "Penambahan Stok" : "Pengurangan Stok",
          };
        }
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([
            {
              name: formData.name,
              category: formData.category,
              stock: parseInt(formData.stock),
              image_url: publicUrl,
              created_at: formData.date,
            },
          ])
          .select()
          .single();
        if (error) throw error;

        productId = newProduct.id;

        // Catat Transaksi Masuk
        transactionPayload = {
          product_id: productId,
          product_name_cached: formData.name,
          category_cached: formData.category,
          image_url_cached: publicUrl,
          type: "IN",
          quantity: parseInt(formData.stock),
          date: new Date(),
          status: "Initial Stock",
        };
      }

      // 3. Eksekusi Pencatatan Transaksi (Jika ada payload)
      if (transactionPayload) {
        const { error: transError } = await supabase
          .from("transactions")
          .insert([transactionPayload]);
        if (transError)
          console.error("Gagal catat riwayat:", transError.message);
      }

      alert("Berhasil menyimpan data!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Edit Barang" : "Tambah Barang"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Masukan Kategori"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Masukan Nama Barang"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Input Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <span className="text-gray-500 truncate max-w-[200px]">
                    {imageFile ? imageFile.name : "Pilih Gambar..."}
                  </span>
                  <Paperclip size={20} className="text-gray-400" />
                </label>
              </div>
              {/* Preview Kecil */}
              {imagePreview && (
                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Jumlah Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="Masukan Stok"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-600"
                />
                <Calendar
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-white">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
          >
            Kembali
          </button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark flex items-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {editData ? "Simpan Perubahan" : "Tambah"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
