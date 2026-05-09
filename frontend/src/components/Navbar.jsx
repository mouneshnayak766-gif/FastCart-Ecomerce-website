import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/");

  };

  return (

    <div className="bg-blue-700 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold flex items-center"
      >
        <span className="bg-yellow-400 text-black px-2 py-1 rounded mr-2">
          F
        </span>

        FastCart
      </Link>

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 w-full md:w-[400px]">

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
          placeholder="Search products, brands and more"
          className="w-full outline-none text-black"
        />

      </div>

      {/* Right Side */}
      <div className="flex gap-6 items-center">

        <Link to="/">
          Home
        </Link>

        {
          user ? (
            <>

              <Link
                to="/account"
                className="font-semibold"
              >
                👤 {user.name}
              </Link>

              <button
                onClick={logout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>

            </>
          ) : (
            <>

              <Link to="/login">
                Login
              </Link>

              <Link to="/signup">
                Signup
              </Link>

            </>
          )
        }

      </div>

    </div>

  );
}