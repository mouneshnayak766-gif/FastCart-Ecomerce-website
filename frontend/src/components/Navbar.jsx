import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Search, ChevronDown, Sun, Moon,
  Home, Heart, ShoppingCart, User, LogOut,
} from "lucide-react";
import { useTheme }  from "../context/ThemeContext";
import { useSearch } from "../context/SearchContext";
import API from "../service/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const {
    search, setSearch,
    selectedCategory, setSelectedCategory,
    sortOption,       setSortOption,
    minRating,        setMinRating,
  } = useSearch();

  // Only show filter dropdowns on the Home page — they're meaningless elsewhere.
  const isHome = location.pathname === "/";

  // ── User ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });

  // Re-read user when location changes (handles login/logout without full reload)
  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("user"))); }
    catch { setUser(null); }
  }, [location.pathname]);

  // ── Cart count ───────────────────────────────────────────────────────────
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }

    API.get("/cart/my-cart")
      .then((res) => {
        const items = res.data || [];
        // Sum quantities so "2x product" counts as 2, not 1
        const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  // Refetch on every route change so count stays fresh after add-to-cart actions
  }, [location.pathname, user]);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await API.post("/users/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch { /* backend error is fine — clear client state anyway */ }
    finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setCartCount(0);
      navigate("/");
    }
  };

  // ── Active link helper ───────────────────────────────────────────────────
  const activeClass = (path) =>
    location.pathname === path
      ? "bg-blue-600 dark:bg-gray-700"
      : "hover:bg-blue-600 dark:hover:bg-gray-800";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <nav className="bg-blue-700 dark:bg-gray-900 px-4 py-3 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">

        {/* ── LOGO ─────────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 text-white shrink-0">
          <div className="bg-yellow-400 text-black w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight">FastCart</span>
        </Link>

        {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-2xl transition-colors duration-200">
          <Search className="text-gray-400 dark:text-gray-500 mr-2 shrink-0" size={18} />
          <input
            type="text"
            placeholder="Search products, brands…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Typing on any page navigates home so results appear
              if (!isHome) navigate("/");
            }}
            className="w-full outline-none text-sm bg-transparent text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1 text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* ── RIGHT SECTION ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 text-white">

          {/* FILTER DROPDOWNS — Home only */}
          {isHome && (
            <div className="hidden xl:flex items-center gap-1 mr-1">

              {/* Category */}
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent appearance-none outline-none cursor-pointer pl-2 pr-6 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <option value=""    className="text-black">All</option>
                  <option value="fashion"     className="text-black">Fashion</option>
                  <option value="mobile"      className="text-black">Mobile</option>
                  <option value="electronics" className="text-black">Electronics</option>
                  <option value="beauty"      className="text-black">Beauty</option>
                  <option value="sports"      className="text-black">Sports</option>
                  <option value="books"       className="text-black">Books</option>
                  <option value="furniture"   className="text-black">Furniture</option>
                </select>
                <ChevronDown size={13} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent appearance-none outline-none cursor-pointer pl-2 pr-6 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <option value=""          className="text-black">Sort</option>
                  <option value="lowToHigh" className="text-black">Low → High</option>
                  <option value="highToLow" className="text-black">High → Low</option>
                </select>
                <ChevronDown size={13} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Rating */}
              <div className="relative">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="bg-transparent appearance-none outline-none cursor-pointer pl-2 pr-6 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <option value=""  className="text-black">Rating</option>
                  <option value="4" className="text-black">4★ & above</option>
                  <option value="3" className="text-black">3★ & above</option>
                  <option value="2" className="text-black">2★ & above</option>
                </select>
                <ChevronDown size={13} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="w-px h-5 bg-blue-500 dark:bg-gray-700 mx-1" />
            </div>
          )}

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {theme === "dark"
              ? <Sun  size={19} className="text-yellow-300" />
              : <Moon size={19} className="text-white" />
            }
          </button>

          {/* ── HOME ICON ──────────────────────────────────────────────── */}
          <Link
            to="/"
            title="Home"
            className={`p-2 rounded-lg transition-colors duration-150 ${activeClass("/")}`}
          >
            <Home size={19} />
          </Link>

          {/* ── WISHLIST ICON ───────────────────────────────────────────── */}
          <Link
            to="/wishlist"
            title="Wishlist"
            className={`p-2 rounded-lg transition-colors duration-150 ${activeClass("/wishlist")}`}
          >
            <Heart
              size={19}
              className={location.pathname === "/wishlist" ? "fill-red-400 text-red-400" : ""}
            />
          </Link>

          {/* ── CART ICON WITH BADGE ────────────────────────────────────── */}
          <Link
            to="/cart"
            title="Cart"
            className={`relative p-2 rounded-lg transition-colors duration-150 ${activeClass("/cart")}`}
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="
                absolute -top-1 -right-1
                bg-red-500 text-white
                text-[10px] font-black
                min-w-[18px] h-[18px] px-1
                rounded-full
                flex items-center justify-center
                leading-none
              ">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* ── USER SECTION ────────────────────────────────────────────── */}
          {user ? (
            <>
              {/* Account link with name on lg+ */}
              <Link
                to="/account"
                title="My Account"
                className={`flex items-center gap-1.5 px-2 py-2 rounded-lg transition-colors duration-150 text-sm font-semibold ${activeClass("/account")}`}
              >
                <User size={19} />
                <span className="hidden lg:inline max-w-[90px] truncate">{user.name}</span>
              </Link>

              {/* Logout — icon on sm, text on lg+ */}
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition font-semibold text-sm"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-gray-800 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-white text-blue-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
              >
                Signup
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
