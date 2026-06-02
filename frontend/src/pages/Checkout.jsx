import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../service/api";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract navigation parameters
  const targetProduct = location.state?.product;
  const directQuantity = location.state?.quantity || 1;
  const bundledItems = location.state?.items;
  const checkoutType = location.state?.checkoutType;

  // Generic extraction mapping regardless of original origin flow
  let orderItems = [];
  if (bundledItems && bundledItems.length > 0) {
    orderItems = bundledItems;
  } else if (targetProduct) {
    orderItems = [
      {
        productId: targetProduct.id,
        productName: targetProduct.name,
        imageUrl: targetProduct.imageUrl,
        quantity: directQuantity,
        price: targetProduct.price,
      },
    ];
  }

  const [user] = useState(JSON.parse(localStorage.getItem("user")));
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Route guarding and protection
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (orderItems.length === 0) {
      navigate("/");
      return;
    }
  }, [user, orderItems.length, navigate]);

  if (!user || orderItems.length === 0) return null;

  // Sum up total aggregate billing amounts across all line entries
  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError("Please input a valid shipping address destination.");
      return;
    }

    setLoading(true);
    setError("");

    const orderPayload = {
      shippingAddress: shippingAddress,
      orderItems: orderItems,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await API.post("/orders/place", orderPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        if (checkoutType === "CART_FLOW") {
          try {
            await API.delete("/cart/clear", {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (clearErr) {
            console.error("Cart cleanup skipped: ", clearErr);
          }
        }

        navigate("/orders", { state: { orderSuccess: true } });
      } else {
        setError("Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* ITEMS LISTING LOOP VIEW */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Review Items</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-200">
                  <img
                    src={item.imageUrl}
                    className="w-16 h-16 object-contain rounded-xl border bg-white p-1"
                    alt={item.productName || "Product image"}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-6 pt-4 flex justify-between items-center text-lg font-bold text-gray-800">
              <span>Grand Total:</span>
              <span className="text-2xl text-green-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* SHIPPING & CONFIRMATION FORM */}
          <div>
            <form onSubmit={handleConfirmOrder} className="space-y-6">
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Shipping Destination Address
                </label>
                <textarea
                  rows="4"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your shipping address"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-blue-500"
                ></textarea>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-amber-800 font-medium flex items-center gap-2">
                  💵 <strong>Payment Option: Cash On Delivery (COD)</strong>
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Pay with cash upon arrival at your shipping address destination point.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-xl font-bold text-xl tracking-wide shadow-md transition"
              >
                {loading ? "Processing Order..." : "Confirm Secure Purchase"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}