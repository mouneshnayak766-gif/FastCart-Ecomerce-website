// Signup.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSignup = async () => {

    try {

      await axios.post(
        "http://localhost:8081/api/users/signup",
        formData
      );

      alert("Successfully Submitted");

      navigate("/login");

    } catch (error) {

      console.log(error);

      alert("Signup Failed");

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px] flex flex-col gap-4">

        <h1 className="text-3xl font-bold text-center">
          Signup
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="PhoneNumber"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <button
          onClick={handleSignup}
          className="bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          Signup
        </button>

      </div>

    </div>
  );
}