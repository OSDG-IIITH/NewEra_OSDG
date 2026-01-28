"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import brandLogo from "@/assets/BrandLogo.png";
import AuthWidget from "@/components/AuthWidget";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHackiiitDropdownOpen, setIsHackiiitDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHackiiitDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkClass =
    "py-2 px-3 rounded-md font-medium text-lg transition-all duration-300 ease-in-out hover:bg-white/5 focus:bg-white/5 outline-none font-oxanium";

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-lg text-gray-200 pt-4" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.1)', WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={brandLogo}
                alt="OSDG"
                className="w-auto h-10 transition-transform duration-300 hover:scale-105"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link className={linkClass} href="/">
              Home
            </Link>
            <Link className={linkClass} href="/guide">
              Guide
            </Link>
            <Link className={linkClass} href="/list">
              Showcase
            </Link>
            <Link className={linkClass} href="/vpn-setup">
              VPN Setup
            </Link>
            <Link
              className={linkClass}
              href="/team"
            >
              Team
            </Link>

            {/* HackIIIT Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsHackiiitDropdownOpen(!isHackiiitDropdownOpen)}
                className={`${linkClass} flex items-center gap-1`}
              >
                HackIIIT
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isHackiiitDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isHackiiitDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-black/95 backdrop-blur-lg border border-gray-700 rounded-md shadow-lg py-2 z-50">
                  <Link
                    href="/hackiiit2026"
                    className="block px-4 py-2 text-gray-200 hover:bg-white/5 transition-all duration-300"
                    onClick={() => setIsHackiiitDropdownOpen(false)}
                  >
                    HackIIIT 2026
                  </Link>
                </div>
              )}
            </div>

            <AuthWidget className="ml-4" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-[#3E4050] focus:outline-none transition duration-300"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black border-t border-gray-700">
            <Link
              href="/"
              className="block px-3 py-2 text-base font-medium rounded-md hover:bg-[#3E4050] transition duration-300"
            >
              Home
            </Link>
            <Link
              href="/guide"
              className="block px-3 py-2 text-base font-medium rounded-md hover:bg-[#3E4050] transition duration-300"
            >
              Guide
            </Link>
            <Link
              href="/list"
              className="block px-3 py-2 text-base font-medium rounded-md hover:bg-[#3E4050] transition duration-300"
            >
              Showcase
            </Link>
            <Link
              href="/vpn-setup"
              className="block px-3 py-2 text-base font-medium rounded-md hover:bg-[#3E4050] transition duration-300"
            >
              VPN Setup
            </Link>
            <Link
              href="/team"
              className="block px-3 py-2 text-base font-medium rounded-md hover:bg-[#3E4050] transition duration-300"
            >
              Team
            </Link>

            {/* Mobile HackIIIT Dropdown */}
            <div>
              <button
                onClick={() => setIsHackiiitDropdownOpen(!isHackiiitDropdownOpen)}
                className="w-full text-left px-3 py-2 text-base font-medium rounded-md hover:bg-[#3E4050] transition duration-300 flex items-center justify-between"
              >
                HackIIIT
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isHackiiitDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isHackiiitDropdownOpen && (
                <div className="pl-6 py-1">
                  <Link
                    href="/hackiiit2026"
                    className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-[#3E4050] transition duration-300"
                  >
                    HackIIIT 2026
                  </Link>
                </div>
              )}
            </div>

            <div className="px-3 py-2">
              <AuthWidget />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
