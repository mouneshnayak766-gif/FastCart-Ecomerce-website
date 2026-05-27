import { useEffect, useState } from "react";
// BUG FIX: 'axios' was imported but never used (API service was used instead).
// Removed the unused import to avoid lint warnings.
import API from "../service/api";

export default function Cart() {

  const [cart, setCart] = useState([]);

  // BUG FIX: Read token inside the component so it's always fresh.
  const token = localStorage.getItem("token");

  // FETCH CART
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const response = await API.get("/cart/my-cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data || []);
    } catch (error) {
      console.error("fetchCart error:", error);
      setCart([]);
    }
  };

  // REMOVE ITEM
  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // BUG FIX: Optimistic update — remove locally instead of re-fetching,
      // which avoids a loading flicker on every remove click.
      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("removeItem error:", error);
      alert(error.response?.data || "Failed to remove item");
    }
  };

  // INCREASE QUANTITY
  const increaseQuantity = async (id) => {
    try {
      const response = await API.put(`/cart/increase/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // BUG FIX: Update only the changed item locally instead of full re-fetch.
      setCart((prev) =>
        prev.map((item) => (item.id === id ? response.data : item))
      );
    } catch (error) {
      console.error("increaseQuantity error:", error);
      alert(error.response?.data || "Cannot increase quantity");
    }
  };

  // DECREASE QUANTITY
  const decreaseQuantity = async (id) => {
    try {
      const response = await API.put(`/cart/decrease/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // BUG FIX: Backend returns "Item Removed" string (not a Cart object)
      // when quantity hits 1 and the item is deleted.
      // Was crashing because it tried to spread a string into the cart array.
      if (response.status === 200 && typeof response.data === "string") {
        // Item was deleted on backend — remove it locally
        setCart((prev) => prev.filter((item) => item.id !== id));
      } else {
        setCart((prev) =>
          prev.map((item) => (item.id === id ? response.data : item))
        );
      }
    } catch (error) {
      console.error("decreaseQuantity error:", error);
    }
  };

  // BUG FIX: Was recalculating total on frontend using price * quantity.
  // The backend already computes and stores totalPrice — use that field
  // so the two values never go out of sync.
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
    0
  );

  return (
    <div className="bg-gray-100 min-h-screen p-8">

      <h1 className="text-4xl font-bold mb-8">🛒 My Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-6">

          {cart.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow text-center">
              <h2 className="text-3xl font-bold">Cart Is Empty 😢</h2>
              <p className="text-gray-500 mt-3">
                Browse products and add them to your cart!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="
                  bg-white p-6 rounded-xl shadow
                  flex flex-col md:flex-row gap-6
                "
              >
                {/* IMAGE */}
                <div className="w-full md:w-[220px] h-[220px] flex items-center justify-center">
                  <img
                    src={`http://localhost:8081${item.imageUrl}`}
                    alt={item.productName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1">

                  <h2 className="text-2xl font-bold">{item.productName}</h2>

                  <p className="text-green-600 text-2xl mt-2 font-bold">
                    ₹{item.price}
                  </p>

                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-4 mt-6">

                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="
                        bg-gray-200 hover:bg-gray-300
                        px-4 py-2 rounded-lg text-xl font-bold
                      "
                    >
                      −
                    </button>

                    <span className="text-2xl font-bold">{item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="
                        bg-gray-200 hover:bg-gray-300
                        px-4 py-2 rounded-lg text-xl font-bold
                      "
                    >
                      +
                    </button>

                  </div>

                  <h2 className="mt-6 text-xl font-bold">
                    Subtotal: ₹{item.totalPrice || item.price * item.quantity}
                  </h2>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="
                      bg-red-500 hover:bg-red-600
                      text-white px-6 py-3
                      rounded-lg mt-6 font-bold
                    "
                  >
                    Remove
                  </button>

                </div>
              </div>
            ))
          )}
        </div>

        {/* PRICE SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">

          <h2 className="text-2xl font-bold mb-6">Price Details</h2>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{cart.length}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>

            <hr />

            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>

          </div>

          <button
            className="
              bg-orange-500 hover:bg-orange-600
              text-white w-full py-4
              rounded-lg font-bold mt-8
            "
          >
            Proceed To Checkout
          </button>

        </div>

      </div>
    </div>
  );
}
