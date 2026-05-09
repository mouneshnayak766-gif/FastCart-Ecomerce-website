// Account.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Account() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [cart, setCart] = useState([]);

  useEffect(() => {

    if (!user) {

      navigate("/login");

      return;
    }

    axios
      .get(`http://localhost:8081/api/cart/user/${user.id}`)
      .then((response) => setCart(response.data));

  }, []);

  const deleteCart = async (id) => {

    await axios.delete(
      `http://localhost:8081/api/cart/${id}`
    );

    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6">

      <div className="bg-white shadow rounded-xl p-6 mb-8">

        <h1 className="text-3xl font-bold mb-4">
          My Account
        </h1>

        <div className="space-y-2">

          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Phone:</strong> {user.phone}
          </p>

          <p>
            <strong>Address:</strong> {user.address}
          </p>

        </div>

      </div>

      <h2 className="text-2xl font-bold mb-4">
        My Cart
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {
          cart.map((item) => (

            <div
              key={item.id}
              className="border rounded-lg p-4 shadow"
            >

              <div className="h-[180px] flex justify-center items-center overflow-hidden">
                <img
                  src={item.imageUrl}
                  className="max-h-full object-contain"
                />
              </div>

              <h2 className="font-bold mt-3">
                {item.productName}
              </h2>

              <p className="text-green-600">
                ₹{item.price}
              </p>

              <p>
                Size: {item.size}
              </p>

              <button
                onClick={() => deleteCart(item.id)}
                className="bg-red-500 text-white px-4 py-2 rounded mt-3 w-full"
              >
                Delete
              </button>

            </div>
          ))
        }

      </div>

    </div>
  );
}