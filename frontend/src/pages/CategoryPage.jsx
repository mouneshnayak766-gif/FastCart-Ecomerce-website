import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../service/api";
import ProductCard from "../components/ProductCard";
import CategoryBar from "../components/CategoryBar";

// Navbar is NO LONGER imported or rendered here.
// AppLayout (via AppRoutes) already wraps this page with <Navbar />.
// Rendering it again would produce a double navbar.

function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/products/category/${category}`)
      .then((res)  => setProducts(res.data || []))
      .catch((err) => {
        console.error("CategoryPage fetch error:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen text-black dark:text-white transition-colors duration-200">

      <CategoryBar />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 capitalize text-gray-800 dark:text-white">
          {category}
        </h2>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-xl py-16 animate-pulse">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-xl py-16">
            No products found in "{category}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
