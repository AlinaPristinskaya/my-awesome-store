import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "My Awesome Shop | Next.js 15",
  description: "Электронная коммерция нового поколения",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased bg-gray-50 text-black`}>
        {/* Navbar будет виден на каждой странице */}
        <Navbar />
        
        {/* Основной контент страницы */}
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster 
  position="bottom-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: '#ffffff',
      color: '#000000',
      border: '1px solid #f3f4f6',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '600',
      padding: '12px 20px',
    },
    success: {
      iconTheme: {
        primary: '#4f46e5', // Твой фиолетовый/индиго акцент
        secondary: '#fff',
      },
    },
  }}
/>
        {/* Простой футер для завершенности вида */}
        <footer className="border-t border-gray-200 bg-white py-10">
          <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
            © 2026 My Awesome Shop. Спринт 2: Корзина и Навигация завершены.
          </div>
        </footer>
      </body>
    </html>
  );
}