import Navbar from "../components/Navbar";
import CategoryBar from "../components/CategoryBar";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { useEffect, useState } from "react";

export default function Home() {

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [sortOption, setSortOption] =
    useState("");

  const [minRating, setMinRating] =
    useState("");

  useEffect(() => {

    fetch("http://localhost:8081/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));

  }, []);

  const filteredProducts = products

    .filter((product) => {

      const matchesSearch =

        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        product.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =

        selectedCategory === "" ||

        product.category === selectedCategory;

      const matchesRating =

        minRating === "" ||

        product.rating >= Number(minRating);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRating
      );

    })

    .sort((a, b) => {

      if (sortOption === "lowToHigh") {

        return a.price - b.price;

      }

      if (sortOption === "highToLow") {

        return b.price - a.price;

      }

      return 0;

    });

  return (

    <div>

      <Header />
      <Banner />
      <Navbar
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortOption={sortOption}
        setSortOption={setSortOption}
        minRating={minRating}
        setMinRating={setMinRating}
      />

      <CategoryBar />

    

      {/* PRODUCTS */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-6
          p-6
        "
      >

        {
          filteredProducts.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))
        }

      </div>

      <Footer />

    </div>

  );
}