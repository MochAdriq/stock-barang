import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteAlert = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Alert Box */}
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center animate-scale-up">
        {/* Icon Merah */}
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle className="text-red-600" size={28} />
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Barang?</h3>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Apakah Anda yakin ingin menghapus <br />
          <span className="font-bold text-gray-800">"{itemName}"</span>? <br />
          Tindakan ini tidak dapat dibatalkan.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-md shadow-red-200 transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAlert;
