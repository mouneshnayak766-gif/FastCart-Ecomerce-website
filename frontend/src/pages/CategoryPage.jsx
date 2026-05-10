import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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

    <div style={{ padding: "20px" }}>

      <h1 style={{ marginBottom: "20px" }}>
        {category.toUpperCase()}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >

        {products.length === 0 ? (

          <h2>No products found</h2>

        ) : (

          products.map((product) => (

            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{
                textDecoration: "none",
                color: "black",
              }}
            >

              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "10px",
                }}
              >

                <img
                  src={`http://localhost:8081${product.imageUrl}`}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "contain",
                  }}
                />

                <h2>{product.name}</h2>

                <p>₹{product.price}</p>

              </div>

            </Link>

          ))

        )}

      </div>

    </div>

  );
}

export default CategoryPage;