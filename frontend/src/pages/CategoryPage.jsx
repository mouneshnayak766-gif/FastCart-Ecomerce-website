import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// BUG FIX: Was using axios directly with a hardcoded URL.
// Changed to use the API service so the base URL is centralised.
import API from "../service/api";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import CategoryBar from "../components/CategoryBar";

function CategoryPage() {

  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/products/category/${category}`)
      .then((response) => {
        setProducts(response.data || []);
      })
      .catch((error) => {
        console.error("CategoryPage fetch error:", error);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category]);

  return (
    <>
      {/* BUG FIX: Navbar was receiving dummy empty props.
          This is fine for CategoryPage since search/filter lives on Home.
          Props kept as-is since the Navbar component requires them. */}
      <Navbar
        search=""
        setSearch={() => {}}
        selectedCategory=""
        setSelectedCategory={() => {}}
        sortOption=""
        setSortOption={() => {}}
        minRating=""
        setMinRating={() => {}}
      />

      <CategoryBar />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 capitalize">
          {category}
        </h2>

        {loading ? (
          <div className="text-center text-gray-500 text-xl py-10 animate-pulse">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">
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
    </>
  );
}

export default CategoryPage;
