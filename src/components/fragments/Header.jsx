import React from "react";
import { Search, Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-white">
      <div>
        <h2 className="text-2xl font-bold">Hello, Taufik</h2>
        <p className="text-blue-100 text-sm">Selamat Datang</p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto"></div>
    </header>
  );
};

export default Header;
