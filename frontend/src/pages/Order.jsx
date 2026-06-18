import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import API from "../service/api";

// ── Status display config ─────────────────────────────────────────────────────
// Centralised here so adding a new status is a one-line change.
const STATUS_CONFIG = {
  PAYMENT_PENDING: { label: "Payment Pending",  classes: "bg-yellow-100 text-yellow-800" },
  PAYMENT_FAILED:  { label: "Payment Failed",   classes: "bg-red-100 text-red-700" },
  PAID:            { label: "Paid ✓",           classes: "bg-green-100 text-green-800" },
  PENDING:         { label: "Processing",       classes: "bg-amber-100 text-amber-800" },  // legacy COD
  PROCESSING:      { label: "Processing",       classes: "bg-amber-100 text-amber-800" },
  SHIPPED:         { label: "Shipped",          classes: "bg-blue-100 text-blue-800" },
  DELIVERED:       { label: "Delivered",        classes: "bg-green-200 text-green-900" },
  CANCELLED:       { label: "Cancelled",        classes: "bg-gray-100 text-gray-500" },
  REFUNDED:        { label: "Refunded",         classes: "bg-purple-100 text-purple-800" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${config.classes}`}>
      {config.label}
    </span>
  );
}

export default function Orders() {
  const location  = useNavigate();
  const navigate  = useNavigate();
  const loc       = useLocation();

  const [orders,           setOrders]           = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(loc.state?.orderSuccess || false);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) { navigate("/login"); return; }

      try {
        const response = await API.get("/orders/my-orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Unable to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    if (showSuccessAlert) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, navigate]);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">

        {/* Success banner */}
        {showSuccessAlert && (
          <div className="mb-8 p-6 bg-green-600 text-white rounded-2xl shadow-md text-center">
            <h2 className="text-3xl font-bold mb-1">🎉 Order Placed & Payment Confirmed!</h2>
            <p className="text-green-100">Your order is confirmed and will be processed shortly.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📦 My Orders</h1>
          <Link to="/account" className="text-blue-600 hover:underline font-semibold">
            &larr; Back to Account
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-xl text-gray-500 py-16">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white text-center p-12 rounded-2xl shadow-sm border">
            <p className="text-2xl font-bold text-gray-400 mb-4">No orders yet.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-6 border border-gray-200">

                {/* ── Order header bar ─────────────────────────────────── */}
                <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-2">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Order ID</p>
                    <h3 className="font-mono text-gray-700 font-bold">#FC-{String(order.id).padStart(5, "0")}</h3>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Date</p>
                    <p className="text-gray-700 font-medium">
                      {new Date(order.orderDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Status</p>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Payment</p>
                    <span className="text-xs font-semibold text-gray-600">
                      {order.paymentMethod === "RAZORPAY" ? "💳 Online" : "💵 COD"}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* ── PAYMENT_PENDING callout ───────────────────────────── */}
                {order.orderStatus === "PAYMENT_PENDING" && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-xl text-yellow-800 text-sm flex items-center gap-2">
                    ⏳ <span>Payment not completed. If you abandoned checkout, this will be auto-cleared.</span>
                  </div>
                )}

                {/* ── PAYMENT_FAILED callout ────────────────────────────── */}
                {order.orderStatus === "PAYMENT_FAILED" && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
                    ❌ <span>Payment failed or signature mismatch. Please contact support if money was deducted.</span>
                  </div>
                )}

                {/* ── Line items ────────────────────────────────────────── */}
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
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-700">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Delivery address ─────────────────────────────────── */}
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  📍 <strong>Delivery to:</strong> {order.shippingAddress}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
