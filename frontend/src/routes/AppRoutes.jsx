import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import CategoryPage from "../pages/CategoryPage";
import ProductDetail from "../pages/ProductDetail";

import Login from "../components/login";
import Signup from "../components/Signup";
import Account from "../components/Account";
import Wishlist from "../pages/Wishlist";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Order";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route
        path="/category/:category"
        element={<CategoryPage />}
      />

      <Route
        path="/product/:id"
        element={<ProductDetail />}
      />

      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/account" element={<Account />} />

      {/* BUG FIX: Was "/Wishlist" and "/Cart" (capital letters).
          React Router is case-sensitive — /wishlist and /Wishlist
          are different routes. Standardised to lowercase. */}
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/cart"     element={<Cart />} />
       <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders"   element={<Orders />} />
      <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
