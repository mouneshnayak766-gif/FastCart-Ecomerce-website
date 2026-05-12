import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Account() {

  const navigate = useNavigate();

  const storedUser =
    localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const token =
    localStorage.getItem("token");

  const [cart, setCart] = useState([]);

  // LOAD CART
  useEffect(() => {

    if (!user || !token) {

      navigate("/login");

      return;
    }

    axios.get(
      "http://localhost:8081/api/cart/my-cart",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    .then((response) => {

      setCart(response.data);

    })

    .catch((error) => {

      console.log(error);

    });

  }, []);

  // DELETE ITEM
  const deleteCart = async (id) => {

    try {

      await axios.delete(
        `http://localhost:8081/api/cart/${id}`
      );

      setCart(
        cart.filter((item) => item.id !== id)
      );

    } catch (error) {

      console.log(error);

    }
  };

  // TOTAL PRICE
  const totalPrice = cart.reduce(

    (total, item) =>

      total + item.price * item.quantity,

    0
  );

  return (

    <div className="bg-gray-100 min-h-screen p-6">

      {/* ACCOUNT */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h1 className="text-3xl font-bold mb-6">
          My Account
        </h1>

        <div className="space-y-3 text-lg">

          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>Phone:</strong> {user?.phoneNumber}
          </p>

          <p>
            <strong>Address:</strong> {user?.address}
          </p>

        </div>

      </div>

      {/* CART TITLE */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-3xl font-bold">
          My Cart
        </h2>

        <h2 className="text-2xl font-bold text-green-600">
          Total: ₹{totalPrice}
        </h2>

      </div>

      {
        cart.length === 0 ? (

          <div className="bg-white p-10 rounded-xl shadow text-center">

            <h1 className="text-3xl font-bold text-gray-600">
              Cart Is Empty
            </h1>

          </div>

        ) : (

          <div className="space-y-6">

            {
              cart.map((item) => (

                <div
                  key={item.id}
                  className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-6
                    flex
                    flex-col
                    md:flex-row
                    gap-6
                  "
                >

                  {/* IMAGE */}

                  <div className="w-full md:w-[220px]">

                    <img
                      src={`http://localhost:8081${item.imageUrl}`}
                      alt={item.productName}
                      className="
                        w-full
                        h-[220px]
                        object-contain
                      "
                    />

                  </div>

                  {/* DETAILS */}

                  <div className="flex-1">

                    <h1 className="text-2xl font-bold">
                      {item.productName}
                    </h1>

                    <p className="text-green-600 text-xl font-bold mt-2">
                      ₹{item.price}
                    </p>

                    <div className="mt-3">

                      <span
                        className="
                          bg-green-600
                          text-white
                          px-3
                          py-1
                          rounded
                          text-sm
                        "
                      >
                        ⭐ 4.3
                      </span>

                    </div>

                    <p className="mt-4 text-gray-600">
                      Delivery in 3 days 🚚
                    </p>

                    <p className="mt-2 text-green-700 font-semibold">
                      In Stock
                    </p>

                    {/* QUANTITY */}

                    <div className="mt-5 flex items-center gap-4">

                      <h2 className="font-bold">
                        Quantity:
                      </h2>

                      <div
                        className="
                          border
                          px-4
                          py-2
                          rounded
                          bg-gray-100
                        "
                      >
                        {item.quantity}
                      </div>

                    </div>

                    {/* SUBTOTAL */}

                    <h2 className="mt-5 text-2xl font-bold text-blue-700">

                      Subtotal:
                      ₹{item.price * item.quantity}

                    </h2>

                    {/* REMOVE */}

                    <button
                      onClick={() =>
                        deleteCart(item.id)
                      }
                      className="
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        px-6
                        py-3
                        rounded-lg
                        mt-6
                        font-bold
                      "
                    >
                      Remove Item
                    </button>

                  </div>

                </div>
              ))
            }

          </div>
        )
      }

    </div>
  );
}