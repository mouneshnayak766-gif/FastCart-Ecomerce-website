import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";
import API from "../service/api";

// ─── Derive a stable fake review count from product id ───────────────────────
// Until backend exposes reviewCount, generate a plausible consistent number.
function fakeReviewCount(id) {
  return ((id * 137 + 89) % 2800) + 200;
}

// ─── Render filled/half/empty stars ──────────────────────────────────────────
function StarRating({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half   = !filled && value >= star - 0.5;
        return (
          <svg key={star} width="13" height="13" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={`h-${star}`}>
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={filled ? "#f59e0b" : half ? `url(#h-${star})` : "#d1d5db"}
            />
          </svg>
        );
      })}
    </span>
  );
}

export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const [wishlisted, setWishlisted] = useState(false);
  const [wLoading,   setWLoading]   = useState(false);

  // Discount: show 20% off with fake original price
  const discountPct   = 20;
  const originalPrice = Math.round(product.price * 1.25);
  const reviewCount   = product.reviewCount ?? fakeReviewCount(product.id);

  // ── Wishlist toggle (fires from the card without leaving the page) ─────────
  const handleWishlist = async (e) => {
    e.preventDefault(); // don't navigate
    const token = localStorage.getItem("accessToken");
    const user  = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
    if (!user || !token) { toast.info("Please login first."); return; }
    if (wLoading) return;

    setWLoading(true);
    try {
      if (!wishlisted) {
        await API.post("/wishlist/add", { productId: product.id }, { headers: { Authorization: `Bearer ${token}` } });
        setWishlisted(true);
        toast.success("Added to Wishlist ❤️");
      } else {
        await API.delete(`/wishlist/remove/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setWishlisted(false);
        toast.info("Removed from Wishlist");
      }
    } catch {
      toast.error("Wishlist action failed.");
    } finally {
      setWLoading(false);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="
        relative
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        cursor-pointer
      ">
        {/* ── Discount badge ──────────────────────────────────────────────── */}
        <span className="absolute top-3 left-3 z-10 bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
          {discountPct}% {t.off}
        </span>

        {/* ── Wishlist heart ───────────────────────────────────────────────── */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? t.removeFromWishlist : t.addToWishlist}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full shadow-sm transition-all duration-150
            ${wishlisted
              ? "bg-red-50 dark:bg-red-900/30"
              : "bg-white/80 dark:bg-gray-700/80 hover:bg-red-50 dark:hover:bg-red-900/30"
            } ${wLoading ? "opacity-50" : ""}`}
        >
          <Heart
            size={18}
            className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-400"}
          />
        </button>

        {/* ── Product image ────────────────────────────────────────────────── */}
        <div className="w-full h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 px-4 pt-8 pb-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* ── Info section ─────────────────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-3">

          {/* Product name */}
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h2>

          {/* Star rating + review count */}
          <div className="flex items-center gap-1.5 mb-3">
            <StarRating value={product.rating} />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{product.rating}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({reviewCount.toLocaleString("en-IN")})</span>
          </div>

          {/* Price row */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-lg font-black text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Free delivery */}
          <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold mt-1.5">
            ✓ {t.freeDelivery}
          </p>
        </div>
      </div>
    </Link>
  );
}
