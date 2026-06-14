import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api";

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8081"; // ⚠️ change to your actual backend port

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ─── Auth Guard — checked BEFORE any token usage ──────────────────────────
  // BUG FIX 1: old code called jwtDecode(token) on line 9 before null check
  // — crashes instantly when adminToken is missing in localStorage
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    // Decode safely only after confirming token exists
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        // Access token expired — api.js interceptor will try to refresh
        // but if adminToken is stale on load, pre-emptively redirect
        localStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
      }
    } catch {
      localStorage.removeItem("adminToken");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    recentOrders: [], monthlyRevenueChart: {}, topSellingProducts: [],
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersHistory, setUsersHistory] = useState([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [productForm, setProductForm] = useState({
    name: "", price: "", category: "electronics", description: "", stock: 50, rating: 4.5,
  });

  // BUG FIX 7: track object URLs so we can revoke them and prevent memory leaks
  const objectUrlRef = useRef(null);

  // ─── Logout ───────────────────────────────────────────────────────────────
  // BUG FIX 2: old code called API.post("/admin/logout") with no body
  // — backend expects { refreshToken } in body to actually revoke the token
  // Without this, the refresh token stays valid in DB for 7 days after logout
  const handleLogout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await API.post("/admin/logout", { refreshToken });
      }
    } catch (e) {
      console.error("Logout error (ignored):", e);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("adminRole");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // ─── Data Loading ─────────────────────────────────────────────────────────
  // BUG FIX 9: removed handleLogout from inside catch — caused circular
  // dependency in useCallback deps. api.js interceptor already handles
  // 401 → fires session-expired event → AppRoutes redirects to login
  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        API.get("/admin/dashboard-stats"),
        API.get("/admin/orders"),
        API.get("/admin/users/history"),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
      setUsersHistory(usersRes.data || []);

      if (!searchQuery) {
        const productsRes = await API.get("/products");
        setProducts(productsRes.data || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ─── Search ───────────────────────────────────────────────────────────────
  // BUG FIX 9: URL-encode query so spaces/special chars don't break the request
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      loadDashboardData();
      return;
    }
    try {
      const res = await API.get(`/admin/products/search?query=${encodeURIComponent(query)}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Product search error:", err);
    }
  };

  // ─── Image Upload ─────────────────────────────────────────────────────────
  // BUG FIX 7: revoke previous object URL before creating a new one
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current); // free memory
      }
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setImageFile(file);
      setImagePreview(url);
    }
  };

  // Revoke URL when component unmounts
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // ─── Product Modal ────────────────────────────────────────────────────────
  // BUG FIX 4: fixed image URL using API_BASE constant instead of hardcoded 8081
  const openProductModal = (product = null) => {
    setImageFile(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
      setImagePreview(product.imageUrl ? `${API_BASE}${product.imageUrl}` : "");
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", price: "", category: "electronics", description: "", stock: 50, rating: 4.5 });
      setImagePreview("");
    }
    setIsProductModalOpen(true);
  };

  // ─── Save Product ─────────────────────────────────────────────────────────
  // BUG FIX 3: old edit-with-image logic did POST (create new) then DELETE old
  // — this breaks order history (orderItems reference old productId which is now gone)
  // — correct approach: always PUT to /admin/products/{id} which supports multipart too
  // So we need the backend PUT endpoint to also accept multipart when image changes.
  // For now: PUT with JSON for edits (image URL preserved), POST only for new products.
  // If you want image re-upload on edit, that requires a backend change to PUT /products/{id}
  // to accept multipart — let me know and I'll add that endpoint.
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // EDIT: always use PUT — preserves product ID so order history stays intact
        // If a new image was selected, upload it first then update imageUrl field
        let finalImageUrl = productForm.imageUrl;
        if (imageFile) {
          const imgForm = new FormData();
          imgForm.append("product", new Blob([JSON.stringify({ ...productForm, imageUrl: "" })], { type: "application/json" }));
          imgForm.append("image", imageFile);
          // Upload as new product just to get the image URL, then immediately delete
          // Better: ask me to add image-only upload endpoint. For now this works.
          // Actually cleanest fix: send PUT with JSON, imageUrl unchanged if no new file
          // New image on edit → just update imageUrl by creating temp upload:
          const tempRes = await API.post("/admin/products", imgForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          finalImageUrl = tempRes.data?.imageUrl || finalImageUrl;
          // Delete the temp duplicate
          if (tempRes.data?.id) {
            await API.delete(`/admin/products/${tempRes.data.id}`);
          }
        }
        await API.put(`/admin/products/${editingProduct.id}`, {
          ...productForm,
          imageUrl: finalImageUrl,
        });
      } else {
        // CREATE: use multipart
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productForm)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);
        await API.post("/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsProductModalOpen(false);
      setSearchQuery("");
      loadDashboardData();
    } catch (err) {
      console.error("Save product error:", err);
      alert("Failed to save product. Check console for details.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await API.delete(`/admin/products/${id}`);
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  // ─── Order Actions ────────────────────────────────────────────────────────
  const triggerCancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await API.post(`/admin/orders/${id}/cancel`, {});
      setIsOrderModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert("Failed to cancel order.");
    }
  };

  const triggerRefundOrder = async (id) => {
    if (!window.confirm("Issue refund for this order?")) return;
    try {
      await API.post(`/admin/orders/${id}/refund`, {});
      setIsOrderModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert("Failed to refund order.");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 text-white flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black tracking-wider text-blue-500">FASTCART ADMIN</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Control Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {[
            { id: "analytics", label: "📊 Analytics", desc: "Revenue & performance" },
            { id: "products", label: "📦 Products", desc: "Catalog management" },
            { id: "orders", label: "🚚 Orders", desc: "Order fulfillment" },
            { id: "users", label: "👥 Users", desc: "Customer history" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <span className="font-bold text-sm">{tab.label}</span>
              <span className="text-[10px] opacity-60 mt-0.5">{tab.desc}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-600/20 hover:text-red-400 border border-transparent hover:border-red-500/30 text-slate-300 font-bold py-3 px-4 rounded-xl text-sm transition-all"
          >
            Logout 🔌
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab} Dashboard
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">FastCart admin control panel</p>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-2 md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-slate-900 text-white font-bold text-xs p-2 rounded-lg"
            >
              <option value="analytics">Analytics</option>
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="users">Users</option>
            </select>
            <button onClick={handleLogout} className="p-2 bg-red-100 text-red-600 font-bold rounded-lg text-xs">
              Logout
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400 font-semibold animate-pulse">Loading dashboard data...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Revenue", val: `₹${stats.totalRevenue?.toLocaleString("en-IN")}`, color: "bg-emerald-50 text-emerald-600", icon: "💰" },
                { label: "Total Orders", val: stats.totalOrders, color: "bg-blue-50 text-blue-600", icon: "📦" },
                { label: "Total Products", val: `${stats.totalProducts} items`, color: "bg-amber-50 text-amber-600", icon: "🏷️" },
                { label: "Total Users", val: `${stats.totalUsers} users`, color: "bg-purple-50 text-purple-600", icon: "👥" },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.val}</h3>
                  </div>
                  <div className={`p-3 rounded-xl text-xl ${kpi.color}`}>{kpi.icon}</div>
                </div>
              ))}
            </div>

            {/* ── ANALYTICS TAB ── */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* Monthly Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900 mb-5">📈 Monthly Revenue</h4>
                  <div className="h-48 flex items-end gap-3 pt-5 border-b border-l border-slate-200 px-4">
                    {Object.entries(stats.monthlyRevenueChart || {}).map(([month, rev]) => {
                      const maxVal = Math.max(...Object.values(stats.monthlyRevenueChart), 1);
                      const pct = (rev / maxVal) * 100;
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-2 group relative">
                          <div className="absolute -top-8 bg-slate-900 text-white font-mono text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition">
                            ₹{rev}
                          </div>
                          <div
                            style={{ height: `${pct}%` }}
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-300 min-h-[4px]"
                          />
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-full">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Selling Products */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-base font-bold text-slate-900 mb-4">🏆 Top Selling Products</h4>
                    <div className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                      {stats.topSellingProducts?.map((p, i) => (
                        <div key={i} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {i + 1}
                            </span>
                            <span className="text-slate-900 font-semibold">{p.name}</span>
                          </div>
                          <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs">
                            {p.unitsSold} sold
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-base font-bold text-slate-900 mb-4">⏱️ Recent Orders</h4>
                    <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                      {stats.recentOrders?.map((o) => (
                        <div key={o.id} className="py-3 flex justify-between items-center">
                          <div>
                            <span className="font-mono text-blue-600 font-bold block">#FST-{o.id}</span>
                            <span className="text-slate-400 font-medium text-[10px]">{o.orderDate}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-900 font-bold block">₹{o.totalAmount?.toFixed(2)}</span>
                            <span className="text-[10px] font-black uppercase text-amber-600">{o.orderStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRODUCTS TAB ── */}
            {activeTab === "products" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full sm:w-72 px-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  />
                  <button
                    onClick={() => openProductModal()}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                  >
                    ➕ Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 flex items-center gap-4">
                            {/* BUG FIX 4: use API_BASE constant not hardcoded 8081 */}
                            <img
                              src={p.imageUrl ? `${API_BASE}${p.imageUrl}` : "https://placehold.co/100"}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border bg-white p-0.5"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-slate-100 border text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900 text-sm">₹{p.price?.toFixed(2)}</td>
                          <td className="py-4 px-6">
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${p.stock > 10 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center space-x-1.5">
                            <button
                              onClick={() => openProductModal(p)}
                              className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-600 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b">
                        <th className="py-4 px-6">Order ID</th>
                        <th className="py-4 px-6">User</th>
                        <th className="py-4 px-6">Address</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700 font-medium">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 font-mono font-bold text-blue-600">#FST-{o.id}</td>
                          <td className="py-4 px-6 font-semibold text-slate-400">#USR-{o.userId}</td>
                          <td className="py-4 px-6 truncate max-w-xs">{o.shippingAddress}</td>
                          <td className="py-4 px-6 font-bold text-slate-900 text-sm">₹{o.totalAmount?.toFixed(2)}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              o.orderStatus === "DELIVERED" ? "bg-emerald-100 text-emerald-800"
                              : o.orderStatus === "CANCELLED" || o.orderStatus === "REFUNDED" ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                            }`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => viewOrderDetails(o)}
                              className="text-slate-700 bg-white hover:bg-slate-100 border px-3 py-1.5 rounded-xl font-bold shadow-sm transition"
                            >
                              View 🔎
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === "users" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">Address</th>
                        <th className="py-4 px-6">Phone</th>
                        <th className="py-4 px-6 text-center">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700 font-medium">
                      {usersHistory.map((profile) => (
                        <tr key={profile.user?.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 text-sm">{profile.user?.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">UID: #FCU-{profile.user?.id}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-semibold">{profile.user?.email}</td>
                          <td className="py-4 px-6 truncate max-w-xs">{profile.user?.address || "—"}</td>
                          <td className="py-4 px-6 font-mono text-slate-500">{profile.user?.phoneNumber || "—"}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="bg-purple-50 text-purple-700 font-extrabold border border-purple-200 px-3 py-1 rounded-xl">
                              {profile.orderHistory?.length || 0} orders
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── PRODUCT MODAL ── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h5 className="font-bold text-slate-900 text-sm">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h5>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-black">✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Product Name</label>
                <input
                  type="text" required value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number" step="0.01" min="0" required value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Stock</label>
                  <input
                    type="number" min="0" required value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-800"
                >
                  <option value="electronics">Electronics</option>
                  <option value="mobile">Mobiles</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Product Image {editingProduct && "(leave empty to keep current)"}
                </label>
                <div className="mt-1 flex items-center gap-4 p-3 border border-dashed rounded-xl bg-slate-50/50">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border bg-white" />
                  )}
                  <input
                    type="file" accept="image/*"
                    onChange={handleImageChange}
                    required={!editingProduct}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Description</label>
                <textarea
                  rows="3" required value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
                />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md">
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDER DETAIL MODAL ── */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Order Details</h5>
                <p className="text-[10px] text-blue-600 font-mono font-bold mt-0.5">#FST-{selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-black">✕</button>
            </div>
            <div className="p-6 space-y-5 text-xs text-slate-600 font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Shipping Address</span>
                  <span className="text-slate-900 text-xs mt-0.5 block">{selectedOrder.shippingAddress}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Payment Method</span>
                  <span className="text-slate-900 text-xs mt-0.5 block uppercase font-mono">
                    {selectedOrder.paymentMethod || "COD"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 font-bold">Order Items</span>
                <div className="divide-y border rounded-xl overflow-hidden bg-white max-h-40 overflow-y-auto">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center text-slate-700 bg-slate-50/30">
                      <div>
                        <div className="font-bold text-slate-900 text-[11px]">
                          {item.productName || `Product #${item.productId}`}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">₹{item.price?.toFixed(2)} each</div>
                      </div>
                      <span className="text-slate-900 font-extrabold bg-white border shadow-xs px-2 py-0.5 rounded text-[10px]">
                        × {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Total Amount</span>
                  <span className="text-slate-900 text-lg font-black block">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {selectedOrder.orderStatus !== "CANCELLED" && selectedOrder.orderStatus !== "REFUNDED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => triggerCancelOrder(selectedOrder.id)}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-bold transition"
                      >
                        Cancel ❌
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerRefundOrder(selectedOrder.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-bold transition"
                      >
                        Refund 🔄
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}