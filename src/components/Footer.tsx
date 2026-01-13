"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import brandLogo from "@/assets/BrandLogo.png";
import iiitLogo from "@/assets/iiit-logo-white.png";

export default function Footer() {
  const pathname = usePathname();

  console.log(pathname);
  // Return NULL if on the hackathon page.
  // This ensures NO HTML is rendered at all.
  if (pathname.startsWith("/hackiiit") || pathname.startsWith("/hackathon")) {
    return null;
  }

  return (
    <footer className="w-full text-gray-200 font-oxanium bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image
                src={brandLogo}
                alt="OSDG"
                className="w-auto h-10"
                priority
              />
            </Link>
            <p className="mt-2 text-sm text-gray-300">IIIT Hyderabad</p>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center">
              <Image
                src={iiitLogo}
                alt="IIIT Hyderabad"
                className="w-auto h-16"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 flex flex-col items-center">
          <p className="text-sm text-center text-gray-400">
            &copy; {new Date().getFullYear()} Open Source Developers Group.
          </p>
        </div>
      </div>
    </footer>
  );
}
