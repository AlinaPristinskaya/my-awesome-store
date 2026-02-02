import { SessionProvider } from "next-auth/react";
import CartInitializer from "@/components/CartInitializer"; // перевір шлях до файлу
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* CartInitializer не має свого візуального інтерфейсу, 
             він просто "живе" тут і стежить за сесією.
          */}
          <CartInitializer />
          
          <Navbar />
          <main>{children}</main>
          
          {/* Тут може бути твій Footer */}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}