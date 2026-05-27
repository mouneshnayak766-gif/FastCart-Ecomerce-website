import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CategoryBar from "../components/CategoryBar";

export default function ProductDetail() {
  const { id } = useParams();

  // =========================
  // STATE
  // =========================
  const [product, setProduct] = useState(null);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  // =========================
  // HELPERS
  // =========================
  const getAuthData = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    return { token, user };
  };

  // =========================
  // CART HANDLER
  // =========================
  const addToCart = async () => {
    const { token, user } = getAuthData();
    if (!user || !token) return alert("Please Login First");

    try {
      await axios.post(
        "http://localhost:8081/api/cart/add",
        {
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product Added To Cart 🛒");
    } catch (error) {
      console.error(error);
      alert("Failed To Add Cart");
    }
  };

  // =========================
  // WISHLIST HANDLER
  // =========================
  const toggleWishlist = async () => {
    const { token, user } = getAuthData();
    if (!user || !token) return alert("Please Login First");

    try {
      if (wishlistAdded) {
        await axios.delete(
          `http://localhost:8081/api/wishlist/remove/${product.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistAdded(false);
      } else {
        await axios.post(
          "http://localhost:8081/api/wishlist/add",
          { productId: product.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistAdded(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Wishlist action failed");
    }
  };

  // =========================
  // FETCH PRODUCT
  // =========================
  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/products/${id}`)
      .then((response) => setProduct(response.data))
      .catch((error) => console.error(error));
  }, [id]);

  // =========================
  // LOADING STATE
  // =========================
  if (!product) {
    return <h1 className="text-3xl p-10">Loading...</h1>;
  }

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <CategoryBar />

      <div className="bg-gray-100 min-h-screen p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-10">
          {/* LEFT IMAGE SECTION */}
          <div className="flex-1">
            {/* IMAGE + HEART */}
            <div className="flex gap-4 items-start">
              <img
                src={`http://localhost:8081${product.imageUrl}`}
                alt={product.name}
                className="w-full max-w-[450px] h-[450px] object-contain border rounded-lg p-4 bg-white"
              />

              {/* WISHLIST HEART */}
              <button
                onClick={toggleWishlist}
                className={`mt-3 w-[70px] h-[70px] flex items-center justify-center rounded-3xl transition-all duration-300 ${
                  wishlistAdded ? "bg-white shadow-md" : "bg-transparent"
                }`}
              >
                <span
                  className={`text-5xl transition-all duration-300 ${
                    wishlistAdded ? "text-red-500" : "text-black"
                  }`}
                >
                  {wishlistAdded ? "♥" : "♡"}
                </span>
              </button>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={addToCart}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-bold w-full"
              >
                Add To Cart 🛒
              </button>

              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold w-full"
              >
                Buy Now ⚡
              </button>
            </div>
          </div>

          {/* RIGHT DETAILS SECTION */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-500 mt-3 text-lg">{product.description}</p>

            {/* RATING */}
            <div className="flex items-center gap-3 mt-4">
              <span className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                ⭐ {product.rating}
              </span>
              <span className="text-gray-500">
                {Math.floor(product.rating * 2500)} Ratings & 500+ Reviews
              </span>
            </div>

            {/* PRICE */}
            <div className="mt-6">
              <h2 className="text-4xl font-bold text-green-700">
                ₹{product.price}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="line-through text-gray-400 text-xl">
                  ₹{product.price + 2000}
                </span>
                <span className="text-green-600 font-bold">20% OFF</span>
              </div>
            </div>

            {/* STOCK */}
            <div className="mt-5">
              <p className="text-green-700 font-bold text-lg">
                {product.stock > 0 ? "In Stock" : "Out Of Stock"}
              </p>
            </div>

            {/* OFFERS */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Available Offers</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Bank Offer 10% Instant Discount</li>
                <li>✅ Free Delivery on orders above ₹499</li>
                <li>✅ Special Price Get extra discount</li>
                <li>✅ EMI starting from ₹199/month</li>
              </ul>
            </div>

            {/* DELIVERY */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-3">Delivery</h3>
              <p className="text-gray-700">Delivery in 3-5 days 🚚</p>
            </div>

            {/* SPECIFICATIONS */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Specifications</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Premium Build Quality</p>
                <p>• Stylish Modern Design</p>
                <p>• Long Lasting Performance</p>
                <p>• 1 Year Warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
