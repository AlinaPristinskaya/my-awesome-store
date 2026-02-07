import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import CartInitializer from "@/components/CartInitializer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

// Налаштування Метаданих для Google та соцмереж
export const metadata: Metadata = {
  title: {
    default: "OSELIA | Мистецтво бути вдома",
    template: "%s | OSELIA",
    
  },
  description: "Естетичні товари для дому: посуд, текстиль та декор. OSELIA — простір, де народжується затишок. Доставка по всій Україні.",
  metadataBase: new URL("https://oselia.com.ua"), // Коли купимо домен, замінимо
  openGraph: {
    title: "OSELIA | Мистецтво бути вдома",
    description: "Якісні товари для вашої оселі. Створюйте затишок разом з нами.",
    url: "/",
    siteName: "OSELIA",
    locale: "uk_UA",
    type: "website",
  },
  icons: {
    icon: "/icon.png", // або "/favicon.ico", якщо ти назвала файл так
    shortcut: "/icon.png",
 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="antialiased">
        <SessionProvider>
          {/* Логіка ініціалізації кошика */}
          <CartInitializer />
          
          <Navbar />
          
          <main className="min-h-screen">
            {children}
          </main>
          
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}