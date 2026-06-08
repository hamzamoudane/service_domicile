import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return (
    <div className="App min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
