import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react"; // Прямой импорт

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextStore | Modern Essentials",
  description: "High-quality products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {/* Оборачиваем всё в SessionProvider, чтобы сессия была доступна сразу */}
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}