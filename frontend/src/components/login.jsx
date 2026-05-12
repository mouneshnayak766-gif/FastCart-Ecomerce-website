// Login.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const response = await axios.post(
        "http://localhost:8081/api/users/login",
        {
          email,
          password,
        }
      );

     if (response.data && response.data.user) {

  localStorage.setItem(
    "token",
    response.data.token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(response.data.user)
  );

  console.log(
    "Stored User:",
    response.data.user
  );

 alert("Login Successful");

window.location.href = "/";

} else {

  alert("Invalid Email or Password");

}

    } catch (error) {

      console.log(error);

      alert("Server Error");

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-[350px] flex flex-col gap-4">

        <h1 className="text-3xl font-bold text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Login
        </button>

      </div>

    </div>
  );
}