"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Don't show navbar on login page - hooks must be called before this
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPass");
      router.push("/admin/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to blackspots page with search query
      router.push(`/admin/blackspots?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50 w-full">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                pathname === "/admin/dashboard"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/blackspots"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                pathname === "/admin/blackspots"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              Blackspots
            </Link>
            <Link
              href="/admin/add"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                pathname === "/admin/add"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              Add Blackspot
            </Link>
            <Link
              href="/admin/admins"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                pathname === "/admin/admins"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              Admins
            </Link>
          </div>

          {/* Search Bar and Logout */}
          <div className="flex items-center gap-6">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blackspots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Search
              </button>
            </form>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}