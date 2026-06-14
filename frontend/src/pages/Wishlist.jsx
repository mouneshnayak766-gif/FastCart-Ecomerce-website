import { useEffect, useState } from "react";
// BUG FIX: Was mixing axios (direct with full URLs) and API service.
// Standardised to use API service everywhere for consistency.
import API from "../service/api";

export default function Wishlist() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // BUG FIX 1: Safe JSON.parse — corrupted localStorage crashes the page.
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch {
    user = null;
  }

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    // BUG FIX 2: No guard for missing token — if the user is not logged in,
    // the axios call fires with "Bearer null" and the backend returns 401,
    // which was silently caught and left the page blank with no message.
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // BUG FIX 3: Was calling the OLD endpoint /api/wishlist/user/{userId}.
      // Backend is now fixed to /api/wishlist/my-wishlist (JWT-based).
      const wishlistResponse = await API.get("/wishlist/my-wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wishlistItems = wishlistResponse.data || [];

      if (wishlistItems.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // BUG FIX 4: Was using Promise.all — if ANY single product fetch failed
      // (e.g. 404 for a deleted product), the ENTIRE page crashed blank.
      // Now using Promise.allSettled so one failed fetch doesn't kill the rest.
      const productRequests = wishlistItems.map((item) =>
        API.get(`/products/${item.productId}`)
      );

      const productResponses = await Promise.allSettled(productRequests);

      // BUG FIX 5: Filter out any failed/null product fetches.
      const productData = productResponses
        .filter(
          (result) =>
            result.status === "fulfilled" && result.value?.data != null
        )
        .map((result) => result.value.data);

      setProducts(productData);

    } catch (error) {
      console.error("fetchWishlist error:", error);
      // BUG FIX 6: Was silently swallowing errors — page showed blank.
      // Now at least resets to empty so the "Wishlist Is Empty" state shows.
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ADD TO CART
  const addToCart = async (product) => {
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      await API.post(
        "/cart/add",
        {
          // BUG FIX 7: Was sending userId from frontend — the fixed backend
          // now ignores the client-provided userId and extracts it from JWT.
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Added to Cart 🛒");
    } catch (error) {
      console.error("addToCart error:", error);
      alert(error.response?.data || "Failed to add to cart");
    }
  };

  // REMOVE FROM WISHLIST
  const removeWishlist = async (productId) => {
    try {
      await API.delete(`/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // BUG FIX 8: Was calling fetchWishlist() after remove — that triggers
      // N product fetches again. Simpler: remove the product locally.
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("removeWishlist error:", error);
      alert(error.response?.data || "Failed to remove from wishlist");
    }
  };

  // NOT LOGGED IN
  if (!token) {
    return (
      <div className="bg-gray-100 min-h-screen p-8 flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h2 className="text-3xl font-bold text-gray-600">
            Please login to view your Wishlist
          </h2>
        </div>
      </div>
    );
  }

  // LOADING STATE — BUG FIX 9: Was no loading state at all.
  // Page showed "Wishlist Is Empty" for a moment before data loaded,
  // which looked like a bug to the user.
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-8 flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h2 className="text-2xl text-gray-500 animate-pulse">
            Loading Wishlist...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">

      <h1 className="text-4xl font-bold mb-8">❤️ My Wishlist</h1>

      {products.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h2 className="text-3xl text-gray-500">Wishlist Is Empty</h2>
          <p className="text-gray-400 mt-3">
            Browse products and add them to your wishlist!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="
                bg-white rounded-xl shadow-md p-5
                hover:shadow-xl transition
              "
            >
              {/* IMAGE */}
              <div className="w-full h-[220px] flex items-center justify-center">
                <img
                  src={`http://localhost:8081${product.imageUrl}`}
                  alt={product.name}
                  className="max-h-full object-contain"
                />
              </div>

              {/* NAME */}
              <h2 className="text-xl font-bold mt-4">{product.name}</h2>

              {/* RATING */}
              {product.rating && (
                <div className="inline-block bg-green-600 text-white px-2 py-1 rounded text-sm mt-3">
                  ⭐ {product.rating}
                </div>
              )}

              {/* PRICE */}
              <h3 className="text-2xl font-bold text-green-700 mt-4">
                ₹{product.price}
              </h3>

              {/* BUTTONS */}
              <div className="mt-5 space-y-3">

                <button
                  onClick={() => addToCart(product)}
                  className="
                    bg-yellow-500 hover:bg-yellow-600
                    text-white w-full py-3
                    rounded-lg font-bold
                  "
                >
                  Add To Cart
                </button>

                <button
                  onClick={() => removeWishlist(product.id)}
                  className="
                    bg-red-500 hover:bg-red-600
                    text-white w-full py-3
                    rounded-lg font-bold
                  "
                >
                  Remove
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
