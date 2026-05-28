import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

// BUG FIX: There were TWO different Account.jsx files uploaded.
// This is the clean profile page version (the correct one for /account route).
// The cart display that was inside the old Account.jsx has its own page (Cart.jsx).

export default function Account() {

  const navigate = useNavigate();

  // BUG FIX: Safe JSON.parse — if localStorage value is corrupt,
  // JSON.parse throws and crashes the whole page. Wrapped in try/catch.
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch {
    user = null;
  }

  // PROTECT PAGE — redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, []);

  if (!user) return null;

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
              
       <div className="bg-gray-100 min-h-screen p-8">

      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-10 text-gray-800">
          👤 My Profile
        </h1>

        {/* USER DETAILS */}
        <div className="grid md:grid-cols-2 gap-6 text-lg">

          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="font-semibold text-gray-500">Name</p>
            <h2 className="text-2xl font-bold mt-2">
              {user.name || "—"}
            </h2>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="font-semibold text-gray-500">Email</p>
            <h2 className="text-xl mt-2">
              {user.email || "—"}
            </h2>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="font-semibold text-gray-500">Phone</p>
            <h2 className="text-xl mt-2">
              {/* BUG FIX: Backend returns phoneNumber (camelCase).
                  The old code also checked phone_number (snake_case) as a
                  fallback — unnecessary now that backend is standardised. */}
              {user.phoneNumber || "—"}
            </h2>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <p className="font-semibold text-gray-500">Address</p>
            <h2 className="text-xl mt-2">
              {user.address || "—"}
            </h2>
          </div>

        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

          {/* BUG FIX: Was linking to "/Cart" and "/Wishlist" (capitals).
              Changed to "/cart" and "/wishlist" to match fixed AppRoutes. */}
          






          <Link
            to="/cart"
            className="
              bg-blue-600 hover:bg-blue-700
              text-white p-6 rounded-2xl
              text-center font-bold text-2xl shadow
            "
          >
            🛒<br />My Cart
          </Link>

          <Link
            to="/wishlist"
            className="
              bg-pink-500 hover:bg-pink-600
              text-white p-6 rounded-2xl
              text-center font-bold text-2xl shadow
            "
          >
            ❤️<br />Wishlist
          </Link>

          <Link
            to="/orders"
            className="
              bg-green-600 hover:bg-green-700
              text-white p-6 rounded-2xl
              text-center font-bold text-2xl shadow
            "
          >
            📦<br />Orders
          </Link>

        </div>

        {/* LOGOUT */}
        <div className="mt-12">
          <button
            onClick={logout}
            className="
              bg-red-500 hover:bg-red-600
              text-white px-8 py-4
              rounded-xl font-bold text-lg
            "
          >
            Logout
          </button>
        </div>

      </div>
   

    </div>
  );
}
