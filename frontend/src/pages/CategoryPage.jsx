import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import CategoryBar from "../components/CategoryBar";

function CategoryPage() {

  const { category } = useParams();

  const [products, setProducts] = useState([]);

  useEffect(() => {

    axios
      .get(`http://localhost:8081/api/products/category/${category}`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

  }, [category]);

  return (
     <>
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
    <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    gap-5
  "
>


  {products.length === 0 ? (

    <h2>No products found</h2>

  ) : (

    products.map((product) => (

      <ProductCard
        key={product.id}
        product={product}
      />

    ))

  )}

</div>
</>
  );
}

export default CategoryPage;