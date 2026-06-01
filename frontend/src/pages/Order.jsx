import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(location.state?.orderSuccess || false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("/api/orders/my-orders", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to resolve dynamic data assets.");
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Automatically hide success notification alert after timeout
    if (showSuccessAlert) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, navigate]);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ORDER PLACEMENT SUCCESS MESSAGE MODAL BANNER */}
        {showSuccessAlert && (
          <div className="mb-8 p-6 bg-green-600 text-white rounded-2xl shadow-md text-center">
            <h2 className="text-3xl font-bold mb-1">🎉 Order Placed Successfully!</h2>
            <p className="text-green-100">Your order package request is now pending fulfillment processing handling.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📦 Order Fulfillment Logs</h1>
          <Link to="/account" className="text-blue-600 hover:underline font-semibold">
            &larr; Back to Dashboard Profile
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-xl text-gray-500">Loading order records history tracking timeline...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white text-center p-12 rounded-2xl shadow-sm border">
            <p className="text-2xl font-bold text-gray-400 mb-4">No logged transactions found matching user context.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">
              Shop Products Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-6 border border-gray-200">
                {/* ORDER METADATA BAR */}
                <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-2">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Transaction ID Reference</p>
                    <h3 className="font-mono text-gray-700 font-bold">#FC-000{order.id}</h3>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Timestamp Details</p>
                    <p className="text-gray-700 font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fulfillment Routing Stage</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      order.orderStatus === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Collection Balance</p>
                    <p className="text-xl font-bold text-green-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* LINE ITEMS */}
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img 
                        src={item.imageUrl} 
                        alt={item.productName} 
                        className="w-16 h-16 object-cover rounded-xl border bg-gray-50" 
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.productName}</h4>
                        <p className="text-gray-500 text-sm">Quantity Count: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* ADDRESS METADATA */}
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  📍 <strong>Delivery Target Destination:</strong> {order.shippingAddress}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}