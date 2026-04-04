import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export const metadata: Metadata = {
  title: "The Dress Outfitters | Precision Tailoring for the Modern Advocate",
  description: "Exquisite legal attire, handcrafted for the modern professional. Discover our collection of suits, gowns, and accessories designed for excellence.",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <Header />
        <CartSidebar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
