import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api"; 

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/admin/login", formData);
      if (response.data && response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid response payload structure from authentication endpoint.");
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError(err.response?.data?.message || "Invalid Admin Credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          FastCart Control Panel
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Authorized Administrator access terminal only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-xl text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Admin Email Address
              </label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="admin123@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-400 transition-all duration-150"
              >
                {loading ? "Authenticating Platform..." : "Secure Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}