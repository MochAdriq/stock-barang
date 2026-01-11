import React from "react";
import InputForm from "../components/ui/InputForm";
import Button from "../components/ui/Button"; // Kita pakai button yang sudah dibuat sebelumnya

const LoginPage = () => {
  return (
    // Container Utama dengan warna background biru custom
    <div className="min-h-screen w-full bg-primary flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-stretch h-[600px]">
        {/* Bagian Kiri: Kotak Putih Besar (Tempat Logo Nanti) */}
        <div className="hidden md:flex flex-1 bg-white rounded-[30px] items-center justify-center p-8 shadow-lg">
          <p className="text-gray-300 font-bold text-2xl">[Area Logo Nanti]</p>
        </div>

        {/* Bagian Kanan: Form Login */}
        <div className="flex-1 flex flex-col justify-center md:px-8 text-white">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Header Teks */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Selamat Datang
              </h2>
              <p className="mt-2 text-sm text-blue-100">Login Dibawah ini</p>
            </div>

            {/* Form Inputs */}
            <form className="space-y-4 text-left">
              {/* Menggunakan komponen input khusus yang kita buat */}
              <InputForm
                label="Username"
                type="text"
                placeholder="taufik123" // Placeholder sebagai contoh isi
                defaultValue="taufik123" // Default value agar mirip desain
              />

              <InputForm
                label="Password"
                type="password"
                placeholder="•••••••••••••"
                defaultValue="password123"
              />

              <div className="pt-4">
                {/* Menggunakan komponen Button yang kita buat di awal, dengan warna custom */}
                <Button className="w-full bg-primary-dark hover:bg-[#2c5c8f] py-3 text-lg">
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
