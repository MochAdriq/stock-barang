import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Panggil Context Auth
import InputForm from "../components/ui/InputForm";
import Button from "../components/ui/Button";
import { Loader2, AlertCircle } from "lucide-react"; // Icon tambahan

const LoginPage = () => {
  // 1. State untuk Logika Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 2. Fungsi saat tombol Login ditekan
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman
    setErrorMsg("");
    setLoading(true);

    try {
      // Coba login ke Supabase
      const { error } = await login(email, password);
      if (error) throw error;

      // Jika sukses, lempar ke Dashboard
      navigate("/dashboard");
    } catch (error) {
      // Jika gagal, tampilkan pesan error
      console.error(error);
      setErrorMsg("Email atau Password salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container Utama (Desain Pilihan Boss)
    <div className="min-h-screen w-full bg-primary flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-stretch md:h-[600px]">
        {/* Bagian Kiri: Kotak Putih Besar (Tempat Logo) */}
        <div className="hidden md:flex flex-1 bg-white rounded-[30px] items-center justify-center p-8 shadow-lg">
          {/* Bisa diganti <img> logo nanti */}
          <div className="text-center">
            <div className="bg-primary/10 p-6 rounded-full inline-block mb-4">
              {/* Contoh Icon Placeholder */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00509d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            </div>
            <p className="text-gray-400 font-bold text-2xl">Stock Gudang App</p>
          </div>
        </div>

        {/* Bagian Kanan: Form Login */}
        <div className="flex-1 flex flex-col justify-center md:px-8 text-white">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Header Teks */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Selamat Datang
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                Login untuk mengakses sistem gudang.
              </p>
            </div>

            {/* ERROR MESSAGE ALERT (Muncul jika password salah) */}
            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl flex items-center gap-3 text-red-100 text-sm">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {/* Input Email */}
              <InputForm
                label="Email Address" // Ubah label jadi Email
                type="email"
                placeholder="admin@gudang.com"
                name="email"
                value={email} // Hubungkan ke state
                onChange={(e) => setEmail(e.target.value)} // Update state saat diketik
                // defaultValue dihapus agar state yang pegang kendali
              />

              {/* Input Password */}
              <InputForm
                label="Password"
                type="password"
                placeholder="•••••••••••••"
                name="password"
                value={password} // Hubungkan ke state
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="pt-4">
                <Button
                  className="w-full bg-[#003f7d] hover:bg-[#002f5d] py-3 text-lg flex justify-center items-center gap-2 transition shadow-lg shadow-blue-900/50"
                  disabled={loading} // Matikan tombol saat loading
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    "Login"
                  )}
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
