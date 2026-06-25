import CategoryBar  from "../components/CategoryBar";
import Banner       from "../components/Banner";
import ProductCard  from "../components/ProductCard";
import Header       from "../components/Header";
import Footer       from "../components/Footer";

import { useEffect, useState } from "react";
import { useSearch } from "../context/SearchContext";
import API from "../service/api";

export default function Home() {
  const [products, setProducts] = useState([]);

  // Search and filter state now lives in SearchContext (shared with Navbar).
  // Navbar writes to it, Home reads from it — no prop drilling, no duplication.
  const { search, selectedCategory, sortOption, minRating } = useSearch();

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data || []))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || product.category === selectedCategory;

      const matchesRating =
        minRating === "" || product.rating >= Number(minRating);

      return matchesSearch && matchesCategory && matchesRating;
    })
    .sort((a, b) => {
      if (sortOption === "lowToHigh")  return a.price - b.price;
      if (sortOption === "highToLow") return b.price - a.price;
      return 0;
    });

  return (
    <div className="dark:bg-gray-950 transition-colors duration-200">
      {/*
        Header (announcement bar) and Banner are Home-specific content.
        The global Navbar is already rendered above by AppLayout.
      */}
      <Header />
      <Banner />
      <CategoryBar />

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-2xl font-bold mb-2">No products found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
