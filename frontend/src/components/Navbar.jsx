import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronDown, User, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
  minRating,
  setMinRating,
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  return (
    <nav
      className="
        bg-blue-700 dark:bg-gray-900
        px-6 py-3
        shadow-md dark:shadow-black/30
        sticky top-0 z-50
        transition-colors duration-200
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          flex flex-col lg:flex-row
          items-center justify-between
          gap-4
        "
      >
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3 text-white font-bold text-4xl"
        >
          <div
            className="
              bg-yellow-400 text-black
              w-12 h-12 rounded-lg
              flex items-center justify-center
              font-bold text-2xl
            "
          >
            F
          </div>
          <span className="text-3xl font-bold">FastCart</span>
        </Link>

        {/* SEARCH BAR */}
        <div
          className="
            flex items-center
            bg-white dark:bg-gray-800
            rounded-lg px-4 py-2
            flex-1 max-w-3xl w-full
            transition-colors duration-200
          "
        >
          <Search className="text-gray-500 dark:text-gray-400 mr-3" size={22} />
          <input
            type="text"
            placeholder="Search products, brands and more"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full outline-none text-lg
              text-black dark:text-white
              bg-transparent
              placeholder:text-gray-400 dark:placeholder:text-gray-500
            "
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-8 text-white font-semibold text-lg">
          {/* CATEGORY FILTER */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent appearance-none outline-none cursor-pointer pr-6"
            >
              <option value="" className="text-black">All Categories</option>
              <option value="fashion" className="text-black">Fashion</option>
              <option value="mobile" className="text-black">Mobile</option>
              <option value="electronics" className="text-black">Electronics</option>
              <option value="beauty" className="text-black">Beauty</option>
              <option value="sports" className="text-black">Sports</option>
              <option value="books" className="text-black">Books</option>
              <option value="furniture" className="text-black">Furniture</option>
            </select>
            <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2" />
          </div>

          {/* SORT */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent appearance-none outline-none cursor-pointer pr-6"
            >
              <option value="" className="text-black">Sort</option>
              <option value="lowToHigh" className="text-black">Price Low → High</option>
              <option value="highToLow" className="text-black">Price High → Low</option>
            </select>
            <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2" />
          </div>

          {/* RATING */}
          <div className="relative">
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="bg-transparent appearance-none outline-none cursor-pointer pr-6"
            >
              <option value="" className="text-black">Rating</option>
              <option value="4" className="text-black">4★ & Above</option>
              <option value="3" className="text-black">3★ & Above</option>
              <option value="2" className="text-black">2★ & Above</option>
            </select>
            <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2" />
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="
              flex items-center justify-center
              w-10 h-10 rounded-lg
              bg-blue-600 dark:bg-gray-800
              hover:bg-blue-500 dark:hover:bg-gray-700
              transition-colors duration-200
            "
          >
            {/* Sun shows in dark mode (click to go light), Moon shows in light mode (click to go dark) */}
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-300" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </button>

          {/* USER */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/account" className="flex items-center gap-2">
                <User size={22} />
                {user?.name}
              </Link>

              <button
                onClick={logout}
                className="
                  bg-red-500 hover:bg-red-600
                  dark:bg-red-600 dark:hover:bg-red-500
                  px-5 py-3 rounded-lg
                  transition-colors duration-200
                "
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
