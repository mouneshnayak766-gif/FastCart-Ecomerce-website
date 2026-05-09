import { useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";

export default function ProductDetail() {
  const { id } = useParams();

  
  // Dummy product (later connect backend)
  const product = {
    id,
    name: "Shirt",
    price: 499,
    imageUrl: "https://via.placeholder.com/400",
  };

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const [selectedSize, setSelectedSize] = useState(null);

 //
 const user = JSON.parse(localStorage.getItem("user"));

const addToCart = async () => {

  if(!user) {
    alert("Please login first");
    return;
  }

  await axios.post(
    "http://localhost:8081/api/cart/add",
    {
      userId: user.id,
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      size: selectedSize,
    }
  );

  alert("Added to cart");
};
  return (
    <div>
      <Navbar />

      <div className="p-6 grid md:grid-cols-2 gap-8">
        
        {/* Image */}
        <img
          src={product.imageUrl}
          className="w-full h-[400px] object-cover rounded"
        />

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-green-600 text-xl mt-2">₹{product.price}</p>

          {/* Size */}
          <h2 className="mt-6 font-semibold">Select Size</h2>
          <div className="flex gap-3 mt-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-lg ${
                  selectedSize === size
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button className="border px-6 py-3 rounded-lg font-semibold" onClick={addToCart}>
              Add to Cart
            </button>

            <button className="bg-yellow-400 px-6 py-3 rounded-lg font-bold">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}