import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api";
import { jwtDecode } from "jwt-decode";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const decoded = jwtDecode(token);
  const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};
useEffect(() => {
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    }
}, []);

  // Authentication Route Guard
  useEffect(() => {
    if (!token) {
      window.location.replace("http://localhost:8081/api/users/login");
    }
  }, [token]);

  // Unified Dashboard State Architecture
  const [activeTab, setActiveTab] = useState("analytics"); // analytics | products | orders | users
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [stats, setStats] = useState({
    totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    recentOrders: [], monthlyRevenueChart: {}, topSellingProducts: []
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersHistory, setUsersHistory] = useState([]);

  // Modal Interactive States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [productForm, setProductForm] = useState({
    name: "", price: "", category: "electronics", description: "", stock: 10, rating: 5.0
  });

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const handleLogout = async () => {
    try {
      await API.post("/admin/logout");
    } catch (err) {
      console.error("Backend redirect tracking detached", err);
    } finally {
      localStorage.removeItem("adminToken");
      window.location.replace("http://localhost:8081/api/users/login");
    }
  };

  // Centralized Application Synchronization Engine
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        API.get("/admin/dashboard-stats", getAuthHeaders()),
        API.get("/admin/orders", getAuthHeaders()),
        API.get("/admin/users/history", getAuthHeaders())
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
      setUsersHistory(usersRes.data || []);

      // If there is no active search keyword, fall back to standard open inventory catalog listing
      if (!searchQuery) {
        const productsRes = await API.get("/products"); // public gateway route
        setProducts(productsRes.data || []);
      }
    } catch (err) {
      console.error("Data Synchronization Failure:", err);
      if (err.response?.status === 401 ||
        err.response?.status === 403) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, getAuthHeaders]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Live Catalog Search Infrastructure
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      loadDashboardData();
      return;
    }
    try {
      const res = await API.get(`/admin/products/search?query=${query}`, getAuthHeaders());
      setProducts(res.data || []);
    } catch (err) {
      console.error("Dynamic product indexing engine fault.", err);
    }
  };

  // Virtual Binary Image Upload Handler Component
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Assign ephemeral viewport target URL
    }
  };

  const openProductModal = (product = null) => {
    setImageFile(null);
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
      setImagePreview(product.imageUrl ? `http://localhost:8080${product.imageUrl}` : "");
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", price: "", category: "electronics", description: "", stock: 50, rating: 4.5 });
      setImagePreview("");
    }
    setIsProductModalOpen(true);
  };

  // Multipart Binary Multi-Stream Saving Routine
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("product", new Blob([JSON.stringify(productForm)], { type: "application/json" }));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingProduct) {
        // Fallback to text configuration update standard structure if asset changes are excluded
        if (!imageFile) {
          await API.put(`/admin/products/${editingProduct.id}`, productForm, getAuthHeaders());
        } else {
          // If a new raw image is uploaded, process it using standard multi-part payload formatting
          await API.post("/admin/products", formData, {
            headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" }
          });
          await API.delete(`/admin/products/${editingProduct.id}`, getAuthHeaders());
        }
      } else {
        await API.post("/admin/products", formData, {
          headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" }
        });
      }
      setIsProductModalOpen(false);
      setSearchQuery("");
      loadDashboardData();
    } catch (err) {
      alert("Error mapping structural binary schema configuration updates to server disk filesystem.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Permanently drop product from system indexes?")) return;
    try {
      await API.delete(`/admin/products/${id}`, getAuthHeaders());
      loadDashboardData();
    } catch (err) {
      alert("Drop operation rejected by execution frame constraint schema bindings.");
    }
  };

  // Lifecycle Order Routing Events
  const triggerCancelOrder = async (id) => {
    if (!window.confirm("Cancel this transaction lifecycle?")) return;
    try {
      await API.post(`/admin/orders/${id}/cancel`, {}, getAuthHeaders());
      setIsOrderModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert("State transition processing error.");
    }
  };

  const triggerRefundOrder = async (id) => {
    if (!window.confirm("Issue accounting reverse refund ledger entries to this client statement?")) return;
    try {
      await API.post(`/admin/orders/${id}/refund`, {}, getAuthHeaders());
      setIsOrderModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert("Accounting reversal transaction denied.");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      {/* Sidebar Terminal Menu Frame */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black tracking-wider text-blue-500">FASTCART AUDIT</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Control Shell v2.4</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {[
            { id: "analytics", label: "📊 Analytics Terminal", desc: "Performance matrix insights" },
            { id: "products", label: "📦 Product Inventory", desc: "Catalog & binary uploads" },
            { id: "orders", label: "🚚 Logistics Queues", desc: "Fulfillment tracking" },
            { id: "users", label: "👥 Registered Users", desc: "Signups & profiles history" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
            >
              <span className="font-bold text-sm">{tab.label}</span>
              <span className="text-[10px] opacity-60 font-medium mt-0.5">{tab.desc}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-600/20 hover:text-red-400 border border-transparent hover:border-red-500/30 text-slate-300 font-bold py-3 px-4 rounded-xl text-sm transition-all">
            Terminate Session 🔌
          </button>
        </div>
      </aside>

      {/* Primary View Area Matrix */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Metrics Desk</h2>
            <p className="text-slate-500 text-xs mt-0.5">Global transaction reporting and systemic catalog indexing console.</p>
          </div>
          <div className="flex gap-2 md:hidden">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="bg-slate-900 text-white font-bold text-xs p-2 rounded-lg">
              <option value="analytics">Analytics</option>
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="users">Users History</option>
            </select>
            <button onClick={handleLogout} className="p-2 bg-red-100 text-red-600 font-bold rounded-lg text-xs">Exit</button>
          </div>
        </div>

        {/* Global Key Performance Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Gross Financial Revenue", val: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, color: "bg-emerald-50 text-emerald-600", icon: "💰" },
            { label: "Global Order Ledgers", val: stats.totalOrders, color: "bg-blue-50 text-blue-600", icon: "📦" },
            { label: "Active Items Catalog", val: `${stats.totalProducts} skus`, color: "bg-amber-50 text-amber-600", icon: "🏷️" },
            { label: "Customer Registration Nodes", val: `${stats.totalUsers} profiles`, color: "bg-purple-50 text-purple-600", icon: "👥" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.val}</h3>
              </div>
              <div className={`p-3 rounded-xl text-xl font-bold ${kpi.color}`}>{kpi.icon}</div>
            </div>
          ))}
        </div>

        {/* Dynamic Context Tab Multiplexer Switching Layer */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Monthly Timeseries Graph Representation Component */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 mb-5">📈 Monthly Revenue Volatility Metrics Vector</h4>
              <div className="h-48 flex items-end gap-3 pt-5 border-b border-l border-slate-200 px-4">
                {Object.entries(stats.monthlyRevenueChart || {}).map(([month, rev]) => {
                  const maxVal = Math.max(...Object.values(stats.monthlyRevenueChart), 1);
                  const pct = (rev / maxVal) * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="absolute -top-8 bg-slate-900 text-white font-mono text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition duration-150">₹{rev}</div>
                      <div style={{ height: `${pct}%` }} className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-300 min-h-[4px]"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top-Selling Analytics Grid alongside Recent Logistical Vectors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-base font-bold text-slate-900 mb-4">🏆 Top Selling Catalog SKUs Matrix</h4>
                <div className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                  {stats.topSellingProducts?.map((p, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                        <span className="text-slate-900 font-semibold">{p.name}</span>
                      </div>
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs">{p.unitsSold} units displaced</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-base font-bold text-slate-900 mb-4">⏱️ Recent Inbound Checkout Invoices</h4>
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

        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
              <div className="w-full sm:w-72 relative">
                <input type="text" placeholder="🔍 Search product index schema..." value={searchQuery} onChange={handleSearch} className="w-full pl-9 pr-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium" />
              </div>
              <button onClick={() => openProductModal()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition">
                ➕ Insert New Catalog SKU
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b">
                    <th className="py-4 px-6">Product Layout Details</th>
                    <th className="py-4 px-6">Taxonomy Tag</th>
                    <th className="py-4 px-6">Retail Margin</th>
                    <th className="py-4 px-6">Stock Volume</th>
                    <th className="py-4 px-6 text-center">Execution Matrices</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 flex items-center gap-4">
                        <img src={p.imageUrl ? `http://localhost:8080${p.imageUrl}` : "https://placehold.co/100"} alt="" className="w-10 h-10 rounded-lg object-cover border bg-white p-0.5" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-xs">{p.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 uppercase"><span className="bg-slate-100 border text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold">{p.category}</span></td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">₹{p.price.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${p.stock > 10 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>{p.stock} units</span>
                      </td>
                      <td className="py-4 px-6 text-center space-x-1.5">
                        <button onClick={() => openProductModal(p)} className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg font-bold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Client Key</th>
                    <th className="py-4 px-6">Shipping Destination</th>
                    <th className="py-4 px-6">Invoice Gross</th>
                    <th className="py-4 px-6">Status Code</th>
                    <th className="py-4 px-6 text-center">Audit Interactivity</th>
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${o.orderStatus === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : o.orderStatus === "CANCELLED" || o.orderStatus === "REFUNDED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => viewOrderDetails(o)} className="text-slate-700 bg-white hover:bg-slate-100 border px-3 py-1.5 rounded-xl font-bold shadow-sm transition">
                          Inspect Lifecycle 🔎
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-bold border-b">
                    <th className="py-4 px-6">System Profile Identification</th>
                    <th className="py-4 px-6">Authentication Mailbox Address</th>
                    <th className="py-4 px-6">Physical Geolocation Mapping</th>
                    <th className="py-4 px-6">Telecom String No</th>
                    <th className="py-4 px-6 text-center">Aggregated Historical Count</th>
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
                      <td className="py-4 px-6 truncate max-w-xs">{profile.user?.address || "No profile address configuration"}</td>
                      <td className="py-4 px-6 font-mono text-slate-500">{profile.user?.phoneNumber || "N/A"}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-purple-50 text-purple-700 font-extrabold border border-purple-200 px-3 py-1 rounded-xl">
                          {profile.orderHistory?.length || 0} invoices recorded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MULTIPART CONFIGURATION UPDATE MODAL VIEWPORT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h5 className="font-bold text-slate-900 text-sm">{editingProduct ? "Modify Registry Catalog Record" : "Append New Hardware Variant Entry"}</h5>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-black">✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">SKU Descriptor Name</label>
                <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Wholesale Pricing (₹)</label>
                  <input type="number" step="0.01" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Stock Unit Count</label>
                  <input type="number" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Catalog Category Assignment Node</label>
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs uppercase font-bold text-slate-800">
                  <option value="electronics">Electronics</option>
                  <option value="mobile">Mobiles</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="beauty">Beauty & Personal Care</option>
                </select>
              </div>
              
              {/* REMOVED IMAGE WEB URL TEXT STRING FIELD -> REPLACED WITH SECURE MULTIPART BINARY SYSTEM */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Product Media Asset Attachment (Multipart File Upload)</label>
                <div className="mt-1 flex items-center gap-4 p-3 border border-dashed rounded-xl bg-slate-50/50">
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border bg-white" />}
                  <input type="file" accept="image/*" onChange={handleImageChange} required={!editingProduct} className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">Detailed Operational Summary Description</label>
                <textarea rows="3" required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"></textarea>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-500/20">Commit Records</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGISTICAL VECTOR MANAGEMENT INTERACTION MODAL DIALOG */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Invoice Configuration Summary View</h5>
                <p className="text-[10px] text-blue-600 font-mono font-bold mt-0.5">ID: #FST-{selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-black text-sm">✕</button>
            </div>
            <div className="p-6 space-y-5 text-xs text-slate-600 font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Associated Shipping Location Target</span>
                  <span className="text-slate-900 text-xs mt-0.5 block">{selectedOrder.shippingAddress}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Payment Pipeline Configuration</span>
                  <span className="text-slate-900 text-xs mt-0.5 block uppercase font-mono">{selectedOrder.paymentMethod || "COD"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 font-bold">Consolidated Ordered Items Checklist</span>
                <div className="divide-y border rounded-xl overflow-hidden bg-white max-h-40 overflow-y-auto">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center text-slate-700 bg-slate-50/30">
                      <div>
                        <div className="font-bold text-slate-900 text-[11px]">{item.productName || `SKU Reference ID: #${item.productId}`}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Unit Value Margin: ₹{item.price?.toFixed(2)}</div>
                      </div>
                      <span className="text-slate-900 font-extrabold bg-white border shadow-xs px-2 py-0.5 rounded text-[10px]">× {item.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Total Cost Invoiced</span>
                  <span className="text-slate-900 text-lg font-black block">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {selectedOrder.orderStatus !== "CANCELLED" && selectedOrder.orderStatus !== "REFUNDED" && (
                    <>
                      <button type="button" onClick={() => triggerCancelOrder(selectedOrder.id)} className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-bold transition">
                        Cancel Order ❌
                      </button>
                      <button type="button" onClick={() => triggerRefundOrder(selectedOrder.id)} className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-bold transition">
                        Reverse Refund 🔄
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition">
                    Dismiss
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