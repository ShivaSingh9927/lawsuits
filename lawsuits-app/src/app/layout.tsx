import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export const metadata: Metadata = {
  title: "Suits - Precision Tailoring for the Modern Counsel",
  description:
    "Bespoke suits and formal wear for legal professionals. Book home measurement service with our master tailors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <CartSidebar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
