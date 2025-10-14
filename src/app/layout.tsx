import type { Metadata } from "next";
import { Inter, Oxanium } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SocialSidebar from "@/components/SocialSidebar";
import WispBotDelayed from "@/components/WispBotDelayed";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });
const oxanium = Oxanium({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: "OSDG | IIIT Hyderabad",
  description: "Open Source Developers Group at IIIT Hyderabad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oxanium.variable}`}>
      <body className={inter.className} style={{
        background: 'linear-gradient(to bottom, #000 60%, #0a1a3c 100%)',
        minHeight: '100vh',
        color: 'white',
      }}>
        <AuthProvider>
          <Navbar />
          <main style={{background: 'transparent'}}>
            {children}
          </main>
          <SocialSidebar />
          <WispBotDelayed />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
