import React from "react";
import { X, Package, Calendar, Tag, Layers, ExternalLink } from "lucide-react";

const DetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  // Format Tanggal Cantik
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up flex flex-col">
        {/* Header Biru */}
        <div className="h-32 bg-primary relative flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition backdrop-blur-md"
          >
            <X size={20} />
          </button>
          <div className="text-white/30">
            <Package size={80} />
          </div>
        </div>

        {/* Content Body */}
        <div className="px-8 pb-8 -mt-12 relative">
          {/* Foto Barang (Floating) */}
          {/* PENTING: Klik gambar untuk lihat ukuran asli */}
          <div className="w-24 h-24 mx-auto mb-4 relative group">
            <div
              className="w-full h-full bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden cursor-pointer hover:shadow-xl transition"
              onClick={() =>
                item.image_url && window.open(item.image_url, "_blank")
              }
              title="Klik untuk lihat ukuran asli"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                  IMG
                </div>
              )}
            </div>

            {/* Icon kecil penanda bisa diklik */}
            {item.image_url && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm pointer-events-none">
                <ExternalLink size={12} />
              </div>
            )}
          </div>

          {/* Judul & Status */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                item.stock > 0
                  ? "bg-blue-50 text-primary"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {item.stock > 0 ? "Available" : "Out of Stock"}
            </span>
          </div>

          {/* Grid Informasi Detail */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Tag size={14} />
                <span className="text-xs font-medium">Kategori</span>
              </div>
              <p className="font-semibold text-gray-700">{item.category}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Layers size={14} />
                <span className="text-xs font-medium">Stok</span>
              </div>
              <p className="font-semibold text-primary text-lg">{item.stock}</p>
            </div>
            <div className="col-span-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span className="text-xs font-medium">Tanggal Masuk</span>
              </div>
              <p className="font-semibold text-gray-700">
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
