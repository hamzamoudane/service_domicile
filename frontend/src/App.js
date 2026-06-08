import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import InterventionRequest from "@/pages/InterventionRequest";
import About from "@/pages/About";
import Reviews from "@/pages/Reviews";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";

import "@/App.css";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/intervention" element={<InterventionRequest />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/account/*"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute role="admin">
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
              <Toaster position="top-right" richColors closeButton />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
