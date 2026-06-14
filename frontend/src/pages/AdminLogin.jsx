import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await API.post("/admin/login", formData);
      const { accessToken, refreshToken, role } = response.data;

      if (accessToken) {
        localStorage.setItem("adminToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("adminRole", role || "ADMIN");
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
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
          Authorized Administrator access only
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
              <label className="block text-sm font-semibold text-slate-300">Admin Email</label>
              <input
                name="email" type="email" required
                value={formData.email} onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300">Password</label>
              <input
                name="password" type="password" required
                value={formData.password} onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 transition"
            >
              {loading ? "Authenticating..." : "Secure Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}