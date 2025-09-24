"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

const ConditionalLayout = ({ children }) => {
  const pathname = usePathname();

  // Check if current path is an admin page
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    // For admin pages, render only the children
    return <div className="min-h-screen">{children}</div>;
  }

  // For regular pages, render with Header and Footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default ConditionalLayout;
