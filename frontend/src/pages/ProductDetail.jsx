import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../service/api"; // Fixed: Using central API service wrapper instead of raw axios
import CategoryBar from "../components/CategoryBar";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [product, setProduct] = useState(null);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  // =========================
  // HELPERS
  // =========================
  const getAuthData = () => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));
    return { token, user };
  };

  // =========================
  // CART HANDLER
  // =========================
  const addToCart = async () => {
    const { token, user } = getAuthData();
    if (!user || !token) {
      toast.info("Please login first.");
      return;
    }

    try {
      await API.post(
        "/cart/add",
        {
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart successfully! 🛒");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart.");
    }
  };

  // =========================
  // WISHLIST HANDLER
  // =========================
  const toggleWishlist = async () => {
    const { token, user } = getAuthData();
    if (!user || !token) {
      toast.info("Please login first.");
      return;
    }

    try {
      if (!wishlistAdded) {
        await API.post(
          "/wishlist/add",
          { productId: product.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistAdded(true);
        toast.success("Added to Wishlist! ❤️");
      } else {
        await API.delete(
          `/wishlist/remove/${product.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistAdded(false);
        toast.info("Removed from Wishlist.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Wishlist action failed.");
    }
  };

  // =========================
  // INITIAL LOADING
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Product details using central API route context
        const prodRes = await API.get(`/products/${id}`);
        setProduct(prodRes.data);

        // 2. Fetch Wishlist check if logged in
        const { token } = getAuthData();
        if (token) {
          const wishRes = await API.get("/wishlist/my-wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = wishRes.data || [];
          const exists = list.some((item) => item.productId === parseInt(id));
          setWishlistAdded(exists);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [id]);

  // =========================
  // DIRECT CHECKOUT
  // =========================
  const handleBuyNow = () => {
    if (!product) return;
    const packagedItems = [
      {
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        quantity: 1,
        price: product.price,
      },
    ];

    navigate("/checkout", {
      state: {
        items: packagedItems,
        checkoutType: "BUY_NOW_FLOW",
      },
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex items-center justify-center">
        <p className="text-xl font-semibold animate-pulse">Loading Product Details...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-black dark:text-white transition-colors duration-200">
      {/* Removed: Duplicate <Navbar /> removed because AppLayout handles global application shell formatting */}
      
      {/* Categories Horizontal Selector Strip */}
      <CategoryBar />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-10 flex flex-col lg:flex-row gap-10">
          
          {/* LEFT CONTENT COLUMN: PRODUCT MEDIA HERO CARD */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <div className="w-full max-w-[450px] aspect-square bg-white rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-center relative shadow-sm">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              {/* Wishlist Interaction Heart Trigger Floating Button */}
              <button
                onClick={toggleWishlist}
                className="absolute top-4 right-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-md p-3 rounded-full transition duration-200"
              >
                <span className={`text-2xl ${wishlistAdded ? "text-red-500" : "text-black dark:text-white"}`}>
                  {wishlistAdded ? "❤️" : "🖤"}
                </span>
              </button>
            </div>

            {/* ACTION TRIGGERS COLUMN BUTTON GROUP */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-[450px] mt-8">
              <button
                onClick={addToCart}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl text-lg shadow-md active:scale-95 transition"
              >
                🛒 Add To Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-md active:scale-95 transition"
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT COLUMN: META DATA DESCRIPTION BLOCK */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* RATING COMPONENT INSIGNIA */}
              <div className="flex items-center gap-3 mt-4">
                <span className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm">
                  ★ {product.rating}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Premium Rating Reviews
                </span>
              </div>

              {/* DYNAMIC PRICING STRUCTURE SUMMARY BLOCK */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-gray-950 dark:text-white">
                    ₹{product.price}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
                    ₹{Math.floor(product.price * 1.25)}
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                    20% OFF
                  </span>
                </div>
              </div>

              {/* STOCK STATUS REPORT BADGE */}
              <div className="mt-5">
                <p className={`font-bold text-lg ${product.stock > 0 ? "text-green-700 dark:text-green-500" : "text-red-600 dark:text-red-400"}`}>
                  {product.stock > 0 ? "● In Stock" : "✕ Out Of Stock"}
                </p>
              </div>

              {/* CURRENT ACTIVE BANK PROMO OFFERS ELEMENT GRID */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Available Offers
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 font-medium text-sm">
                  <li className="flex items-start gap-2">
                    <span>✅</span> <span>Bank Offer 10% Instant Discount on credit cards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✅</span> <span>Free Delivery on orders above ₹499.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✅</span> <span>Special Price: Get extra seasonal items added on checkout.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✅</span> <span>No Cost EMI options starting from ₹199/month.</span>
                  </li>
                </ul>
              </div>

              {/* DELIVERY METRIC ESTIMATE DATA FIELD */}
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Delivery Details</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Delivery guaranteed in 3-5 working days 🚚
                </p>
              </div>

              {/* EXTENDED SPECIFICATIONS CONTAINER BLOCK ELEMENT */}
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Specifications</h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                  <p>• Engineered Premium Build Quality Materials</p>
                  <p>• Ergonomic, Stylish Modern Architectural Design</p>
                  <p>• Optimized Longevity with High Endurance Rating Metrics</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}