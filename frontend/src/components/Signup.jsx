import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", address: "", phoneNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      await API.post("/users/signup", formData);
      alert("Signup Successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data || "Signup Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px] flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">Signup</h1>

        <input type="text" name="name" placeholder="Name" className="border p-3 rounded" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" className="border p-3 rounded" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" className="border p-3 rounded" onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" className="border p-3 rounded" onChange={handleChange} />
        <input type="text" name="phoneNumber" placeholder="Phone Number" className="border p-3 rounded" onChange={handleChange} />

        <button
          onClick={handleSignup}
          className="bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          Signup
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}