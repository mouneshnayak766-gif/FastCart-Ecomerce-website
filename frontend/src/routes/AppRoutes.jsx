import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import CategoryPage from "../pages/CategoryPage";
import ProductDetail from "../pages/ProductDetail";

import Login from "../components/login";
import Signup from "../components/Signup";
import Account from "../components/Account";

export default function AppRoutes() {

  return (

    <Routes>

      <Route path="/" element={<Home />} />

      <Route
        path="/category/:name"
        element={<CategoryPage />}
      />

      <Route
        path="/product/:id"
        element={<ProductDetail />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/account"
        element={<Account />}
      />

    </Routes>
  );
}