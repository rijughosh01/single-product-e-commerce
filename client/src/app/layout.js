import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HydrationBoundary from "@/components/HydrationBoundary";
import AuthWrapper from "@/components/AuthWrapper";
import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pure Ghee Store - Premium Quality Ghee Products",
  description:
    "Discover our premium collection of pure cow ghee, buffalo ghee, and organic ghee. Authentic, traditional, and healthy ghee products delivered to your doorstep.",
  keywords:
    "ghee, pure ghee, cow ghee, buffalo ghee, organic ghee, A2 ghee, traditional ghee",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HydrationBoundary>
          <AuthProvider>
            <AuthWrapper>
              <CartProvider>
                <WishlistProvider>
                  <ConditionalLayout>{children}</ConditionalLayout>
                  <Toaster position="top-right" richColors />
                </WishlistProvider>
              </CartProvider>
            </AuthWrapper>
          </AuthProvider>
        </HydrationBoundary>
      </body>
    </html>
  );
}
