import {
  Link,
  useNavigate
} from "react-router-dom";

import { useEffect } from "react";

export default function Account() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // PROTECT PAGE

  useEffect(() => {

    if (!user) {

      navigate("/login");

    }

  }, []);

  // LOGOUT

  const logout = () => {

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    navigate("/login");
  };

  if (!user) {

    return null;
  }

  return (

    <div className="bg-gray-100 min-h-screen p-8">

      <div
        className="
          max-w-5xl
          mx-auto
          bg-white
          p-8
          rounded-2xl
          shadow-lg
        "
      >

        {/* TITLE */}

        <h1
          className="
            text-4xl
            font-bold
            mb-10
            text-gray-800
          "
        >
          👤 My Profile
        </h1>

        {/* USER DETAILS */}

        <div
          className="
            grid
            md:grid-cols-2
            gap-6
            text-lg
          "
        >

          <div
            className="
              bg-gray-50
              p-5
              rounded-xl
            "
          >

            <p className="font-semibold text-gray-500">
              Name
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {user.name}
            </h2>

          </div>

          <div
            className="
              bg-gray-50
              p-5
              rounded-xl
            "
          >

            <p className="font-semibold text-gray-500">
              Email
            </p>

            <h2 className="text-xl mt-2">
              {user.email}
            </h2>

          </div>

          <div
            className="
              bg-gray-50
              p-5
              rounded-xl
            "
          >

            <p className="font-semibold text-gray-500">
              Phone
            </p>

            <h2 className="text-xl mt-2">

              {
                user.phoneNumber
                ||
                user.phone_number
              }

            </h2>

          </div>

          <div
            className="
              bg-gray-50
              p-5
              rounded-xl
            "
          >

            <p className="font-semibold text-gray-500">
              Address
            </p>

            <h2 className="text-xl mt-2">
              {user.address}
            </h2>

          </div>

        </div>

        {/* BUTTONS */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
            mt-12
          "
        >

          {/* CART */}

          <Link
            to="/Cart"

            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              p-6
              rounded-2xl
              text-center
              font-bold
              text-2xl
              shadow
            "
          >

            🛒
            <br />

            My Cart

          </Link>

          {/* WISHLIST */}

          <Link
            to="/Wishlist"

            className="
              bg-pink-500
              hover:bg-pink-600
              text-white
              p-6
              rounded-2xl
              text-center
              font-bold
              text-2xl
              shadow
            "
          >

            ❤️
            <br />

            Wishlist

          </Link>

          {/* ORDERS */}

          <Link
            to="/orders"

            className="
              bg-green-600
              hover:bg-green-700
              text-white
              p-6
              rounded-2xl
              text-center
              font-bold
              text-2xl
              shadow
            "
          >

            📦
            <br />

            Orders

          </Link>

        </div>

        {/* LOGOUT */}

        <div className="mt-12">

          <button
            onClick={logout}

            className="
              bg-red-500
              hover:bg-red-600
              text-white
              px-8
              py-4
              rounded-xl
              font-bold
              text-lg
            "
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}