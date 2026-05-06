import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-blue-700 text-white px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">

      {/* Logo */}
      <div className="flex items-center text-xl font-bold">
        <span className="bg-yellow-400 text-black px-2 py-1 rounded mr-2">F</span>
        FastCart
      </div>

      {/* Search Bar */}
     <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-blue-400 shadow-sm w-full md:w-1/2  ml-50">
  
  {/* Search Icon */}
  <svg
    className="w-5 h-5 text-gray-500 mr-3"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35m1.6-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>

  {/* Input */}
  <input
    type="text"
    placeholder="Search for products, brands and more"
    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
  />
</div>

      {/* Actions */}
      <div className="flex gap-4 items-center">
        <button className="bg-white text-blue-700 px-4 py-1 rounded font-semibold">
          Login
        </button>

        <button className="flex items-center gap-1">
          🛒 Cart
        </button>
      </div>

    </div>
  );
}
  