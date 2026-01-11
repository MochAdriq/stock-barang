import React from "react";
import { Search, Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-white">
      <div>
        <h2 className="text-2xl font-bold">Hello, Taufik</h2>
        <p className="text-blue-100 text-sm">Selamat Datang</p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Search Bar */}
        {/* <div className="relative flex-1 md:w-80 bg-white rounded-2xl">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
          />
        </div> */}

        {/* Notification Button */}
        <button className="bg-white p-2.5 rounded-xl shadow-sm text-dark hover:bg-gray-50 transition">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
