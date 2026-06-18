import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../service/api";

// ─── Load Razorpay checkout.js script dynamically ────────────────────────────
// Calling this multiple times is safe — it detects if already loaded.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Payment step states ──────────────────────────────────────────────────────
// idle → initiating → awaiting_payment → verifying → done
// On any error: back to idle with error message shown.

export default function Checkout() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Extract navigation parameters (unchanged from original) ──────────────
  const targetProduct  = location.state?.product;
  const directQuantity = location.state?.quantity || 1;
  const bundledItems   = location.state?.items;
  const checkoutType   = location.state?.checkoutType;

  let orderItems = [];
  if (bundledItems && bundledItems.length > 0) {
    orderItems = bundledItems;
  } else if (targetProduct) {
    orderItems = [{
      productId:   targetProduct.id,
      productName: targetProduct.name,
      imageUrl:    targetProduct.imageUrl,
      quantity:    directQuantity,
      price:       targetProduct.price,
    }];
  }

  const [user]            = useState(() => JSON.parse(localStorage.getItem("user")));
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [paymentStep,     setPaymentStep]     = useState("idle");
  const [error,           setError]           = useState("");

  // ── Route guards (unchanged from original) ────────────────────────────────
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (orderItems.length === 0) { navigate("/"); return; }
  }, [user, orderItems.length, navigate]);

  if (!user || orderItems.length === 0) return null;

  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  const isLoading = paymentStep !== "idle";

  // ── Step label for the button ─────────────────────────────────────────────
  const buttonLabel = {
    idle:             "Confirm & Pay",
    initiating:       "Preparing Payment...",
    awaiting_payment: "Complete Payment in Pop-up...",
    verifying:        "Verifying Payment...",
    done:             "Payment Confirmed ✓",
  }[paymentStep] ?? "Confirm & Pay";

  // ── Main payment handler ──────────────────────────────────────────────────
  const handleConfirmOrder = useCallback(async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    setError("");
    setPaymentStep("initiating");

    // ── PHASE 1: Create PAYMENT_PENDING order + Razorpay order ───────────
    let initiateData;
    try {
      const { data } = await API.post("/payment/initiate", {
        shippingAddress,
        orderItems,
      });
      initiateData = data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to initiate payment. Please try again.";
      setError(msg);
      setPaymentStep("idle");
      return;
    }

    // ── Load Razorpay script ───────────────────────────────────────────────
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Could not load payment gateway. Check your internet connection and try again.");
      setPaymentStep("idle");
      return;
    }

    setPaymentStep("awaiting_payment");

    // ── PHASE 2: Open Razorpay modal ──────────────────────────────────────
    const razorpayOptions = {
      key:         initiateData.keyId,
      amount:      initiateData.amount,        // paise
      currency:    initiateData.currency,
      name:        "FastCart",
      description: `Order #${initiateData.orderId}`,
      image:       "/favicon.ico",             // optional logo in modal header
      order_id:    initiateData.razorpayOrderId,

      prefill: {
        name:    user?.name  || "",
        email:   user?.email || "",
        contact: user?.phone || "",
      },

      notes: {
        orderId: String(initiateData.orderId),
      },

      theme: { color: "#16a34a" },  // green-600 — matches your UI

      // ── Success handler ─────────────────────────────────────────────────
      // Razorpay calls this ONLY after payment is collected on their end.
      // You MUST verify the signature server-side — never trust this alone.
      handler: async (razorpayResponse) => {
        setPaymentStep("verifying");

        try {
          await API.post("/payment/verify", {
            orderId:            initiateData.orderId,
            razorpayPaymentId:  razorpayResponse.razorpay_payment_id,
            razorpayOrderId:    razorpayResponse.razorpay_order_id,
            razorpaySignature:  razorpayResponse.razorpay_signature,
            checkoutType:       checkoutType || null,
          });

          setPaymentStep("done");

          // Small delay so the user sees the "Payment Confirmed ✓" state
          setTimeout(() => {
            navigate("/orders", { state: { orderSuccess: true } });
          }, 800);

        } catch (verifyErr) {
          const msg = verifyErr.response?.data?.message
            || "Payment verification failed. Please contact support with your order ID: " + initiateData.orderId;
          setError(msg);
          setPaymentStep("idle");
        }
      },

      // ── Modal dismiss handler ───────────────────────────────────────────
      // User closed the modal without paying. The PAYMENT_PENDING order
      // stays in DB — a nightly cleanup job should purge stale ones.
      // We reset state so the user can retry.
      modal: {
        ondismiss: () => {
          setError("Payment was cancelled. Click below to try again.");
          setPaymentStep("idle");
        },
        escape:           true,
        backdropclose:    false,  // prevent accidental close on outside click
        animation:        true,
        confirm_close:    true,   // show "Are you sure?" before closing
      },
    };

    try {
      const rzp = new window.Razorpay(razorpayOptions);

      // Razorpay fires this on payment failure BEFORE closing the modal.
      // The user can retry inside the modal, so don't navigate away here.
      rzp.on("payment.failed", (failResponse) => {
        console.error("Razorpay payment.failed:", failResponse.error);
        // Don't reset paymentStep here — modal is still open for retry
        // The ondismiss above will fire if they close after failure
      });

      rzp.open();
    } catch (rzpErr) {
      setError("Failed to open payment gateway. Please refresh and try again.");
      setPaymentStep("idle");
    }
  }, [shippingAddress, orderItems, checkoutType, user, navigate]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl font-medium flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Awaiting payment overlay message */}
        {paymentStep === "awaiting_payment" && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl font-medium flex items-center gap-2 border border-blue-200">
            <span className="animate-spin">⏳</span>
            <span>Payment window is open. Complete the payment there — do not close this tab.</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* ── Items listing ────────────────────────────────────────────── */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Review Items</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-200">
                  <img
                    src={item.imageUrl}
                    className="w-16 h-16 object-contain rounded-xl border bg-white p-1"
                    alt={item.productName || "Product"}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">{item.productName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-700 whitespace-nowrap">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Grand Total</span>
              <span className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Shipping + payment form ───────────────────────────────────── */}
          <div>
            <form onSubmit={handleConfirmOrder} className="space-y-6">
              <div>
                <label className="block text-gray-600 font-semibold mb-2">
                  Shipping Address
                </label>
                <textarea
                  rows="4"
                  required
                  disabled={isLoading}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your full shipping address"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>

              {/* Payment method badge */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-blue-800 font-semibold flex items-center gap-2 text-sm">
                  🔒 <span>Secure Payment via Razorpay</span>
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  UPI, Cards, Net Banking, Wallets — all supported. Your payment is encrypted end-to-end.
                </p>
              </div>

              {/* Razorpay branding — required per their T&C */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>Powered by</span>
                <span className="font-bold text-gray-500">Razorpay</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-4 rounded-xl font-bold text-xl tracking-wide shadow-md transition text-white
                  ${paymentStep === "done"
                    ? "bg-green-700"
                    : isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {isLoading && paymentStep !== "done" && (
                  <span className="inline-block animate-spin mr-2">⏳</span>
                )}
                {paymentStep === "done" && <span className="mr-2">✓</span>}
                {buttonLabel}
              </button>

              <p className="text-center text-xs text-gray-400">
                By confirming, you agree to our Terms of Service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
