"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/debate", label: "Debate Arena" },
    { href: "/dashboard", label: "Analytics" },
    { href: "/history", label: "History" },
    { href: "/profile", label: "Profile" }
  ];

  return (
    <header className="border-b-2 border-white/15 bg-[#181614] text-[#ffffff] sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200 shadow-md">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-[#d4af37] shadow-md flex items-center justify-center bg-black flex-shrink-0">
            <img src="/logo.jpg" alt="VerbaFlow Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-serif font-extrabold tracking-widest text-[#ffffff] uppercase leading-none">
              VerbaFlow
            </h1>
            <p className="text-[8px] sm:text-[9px] font-sans font-extrabold tracking-[0.2em] text-[#d4af37] uppercase mt-1">
              Atelier of Modern Eloquence
            </p>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-2 lg:gap-3">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 lg:px-5 py-2 rounded-full border-2 text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md scale-105"
                  : "border-white/40 text-[#ffffff] bg-transparent hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-xl border border-white/30 text-[#d4af37] bg-black/40 focus:outline-none"
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 text-[#d4af37]" /> : <Menu className="w-6 h-6 text-[#d4af37]" />}
      </button>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#181614] border-b-2 border-[#d4af37] p-6 space-y-3 shadow-2xl z-50 animate-fadeIn">
          <nav className="flex flex-col gap-2.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-5 py-3 rounded-2xl border-2 text-xs font-extrabold uppercase tracking-wider text-center transition-all ${
                    isActive
                      ? "bg-[#d4af37] text-black border-[#d4af37] shadow-md"
                      : "border-white/20 text-[#ffffff] bg-black/40 hover:border-[#d4af37]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
