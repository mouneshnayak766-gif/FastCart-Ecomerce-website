import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../service/api";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", address: "", phoneNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await API.post("/users/signup", formData);
      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <form
        onSubmit={handleSignup}
        className="bg-white dark:bg-gray-800 text-black dark:text-white p-8 rounded-xl shadow-lg w-[400px] flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center">Signup</h1>

        <input type="text" name="name" placeholder="Name" className="border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-black dark:text-white" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" className="border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-black dark:text-white" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" className="border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-black dark:text-white" onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" className="border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-black dark:text-white" onChange={handleChange} />
        <input type="text" name="phoneNumber" placeholder="Phone Number" className="border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-black dark:text-white" onChange={handleChange} />

        <button
          type="submit"
          className="bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          Signup
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}