import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);

  useEffect(() => {

    axios
      .get(`http://localhost:8081/api/products/${id}`)
      .then((response) => {

        setProduct(response.data);

      });

  }, [id]);

  if (!product) {

    return <h1>Loading...</h1>;

  }

  return (

    <div className="flex gap-10 p-10">

      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-[400px] h-[400px] object-contain border"
      />

      <div>

        <h1 className="text-4xl font-bold">
          {product.name}
        </h1>

        <h2 className="text-3xl text-green-600 mt-4">
          ₹{product.price}
        </h2>

        <button className="bg-yellow-500 px-6 py-3 rounded mt-6">
          Add to Cart
        </button>

      </div>

    </div>
  );
}