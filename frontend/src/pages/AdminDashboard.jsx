import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // Routing Core Guard
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, navigate]);

  // View States
  const [activeTab, setActiveTab] = useState("products"); // products | orders
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Management Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "", price: "", category: "", imageUrl: "", description: "", rating: 4.0, stock: 10
  });

  // Configured Request Header Factory Helper
  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // Data Refresh Engine Orchestrator
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        API.get("/admin/dashboard-stats", getAuthHeaders()),
        API.get("/products"), // Open endpoint or change route based on preference
        API.get("/admin/orders", getAuthHeaders())
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Dashboard Data Synchronization Failure", err);
      if (err.response?.status === 403 || err.response?.status === 410) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, getAuthHeaders]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // Open Form Handling (Create vs Update configuration)
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", price: "", category: "fashion", imageUrl: "", description: "", rating: 4.5, stock: 50 });
    }
    setIsModalOpen(true);
  };

  // SAVE PRODUCT (POST Create / PUT Update Operations)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct.id}`, productForm, getAuthHeaders());
      } else {
        await API.post("/admin/products", productForm, getAuthHeaders());
      }
      setIsModalOpen(false);
      loadDashboardData(); // Refresh system values
    } catch (err) {
      alert("Error writing configuration update parameter payload onto server filesystem target.");
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await API.delete(`/admin/products/${id}`, getAuthHeaders());
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete requested entity reference targeting backend context mappings.");
    }
  };

  // UPDATE ORDER DISPATCH TRACKING STATUS
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/orders/${orderId}/status`, { status: newStatus }, getAuthHeaders());
      loadDashboardData();
    } catch (err) {
      alert("Failed to assign revised monitoring workflow lifecycle token to execution framework.");
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl font-bold text-slate-600 animate-pulse">Syncing Administrative Dashboard State...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black tracking-wider text-blue-400">FASTCART ADMIN</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${activeTab === "products" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            📦 Manage Catalog Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${activeTab === "orders" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            🚚 Fulfillment Orders
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-900 text-red-200 font-bold py-3 px-4 rounded-xl transition">
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Container Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Overview Core Metrics</h2>
            <p className="text-slate-500 text-sm">Realtime store performance values indicator panel matrix.</p>
          </div>
          <div className="flex gap-3 md:hidden">
            <button onClick={() => setActiveTab("products")} className={`px-4 py-2 rounded-lg font-bold ${activeTab === "products" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border"}`}>Products</button>
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-lg font-bold ${activeTab === "orders" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border"}`}>Orders</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold">Exit</button>
          </div>
        </div>

        {/* METRIC KPI CARDS PANEL ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gross Revenues Balance</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</h3>
            </div>
            <div className="p-4 rounded-xl bg-green-50 text-green-600 text-2xl font-bold">💰</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Sales Invoices</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 text-blue-600 text-2xl">📦</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Catalog Inventory</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalProducts} Items</h3>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 text-amber-600 text-2xl">🏷️</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Unique Customers Active</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalUsers} Clients</h3>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 text-purple-600 text-2xl">👥</div>
          </div>
        </div>

        {/* VIEW CONDITIONAL CONTEXT CONTROLLER */}
        {activeTab === "products" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h4 className="text-xl font-bold text-slate-800">Inventory Management Catalog</h4>
              <button onClick={() => openProductModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-sm">
                ➕ Add New Inventory Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-bold tracking-wider border-b">
                    <th className="py-4 px-6">Product Details</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Retail Cost</th>
                    <th className="py-4 px-6">Stock Level</th>
                    <th className="py-4 px-6 text-center">Actions Modification Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 text-sm">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 flex items-center gap-4">
                        <img src={p.imageUrl || "/images/placeholder.jpg"} alt="" className="w-12 h-12 rounded-lg object-contain border bg-white p-1" />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{p.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 uppercase font-medium text-xs tracking-wider"><span className="bg-slate-100 px-2.5 py-1 rounded-md border text-slate-600">{p.category}</span></td>
                      <td className="py-4 px-6 font-bold text-slate-900">₹{p.price.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`font-bold px-2 py-1 rounded text-xs ${p.stock > 10 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>{p.stock} units</span>
                      </td>
                      <td className="py-4 px-6 text-center space-x-2">
                        <button onClick={() => openProductModal(p)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold transition">Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-semibold transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ORDERS DISPATCH MODULE VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50">
              <h4 className="text-xl font-bold text-slate-800">Fulfillment Workflow Queue</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-bold tracking-wider border-b">
                    <th className="py-4 px-6">Order Identification ID</th>
                    <th className="py-4 px-6">Customer Identification ID</th>
                    <th className="py-4 px-6">Shipping Location Destination</th>
                    <th className="py-4 px-6">Total Cost</th>
                    <th className="py-4 px-6">Current Tracking Status</th>
                    <th className="py-4 px-6 text-center">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 text-sm">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">#FST-{o.id}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">User ref: #{o.userId}</td>
                      <td className="py-4 px-6 truncate max-w-xs">{o.shippingAddress}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">₹{o.totalAmount?.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${o.orderStatus === "DELIVERED" ? "bg-green-100 text-green-800" : o.orderStatus === "SHIPPED" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={o.orderStatus || "PENDING"}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition text-xs"
                        >
                          <option value="PENDING">Pending Processing</option>
                          <option value="SHIPPED">Handed over to Dispatch Courier</option>
                          <option value="DELIVERED">Delivered Successfully</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CRUD MODAL INTERACTION SUB-COMPONENT DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
              <h5 className="text-lg font-bold text-slate-900">{editingProduct ? "Revise Existing Product Catalog Fields" : "Add Brand New Inventory Item Entry"}</h5>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Title</label>
                <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Retail Price (₹)</label>
                  <input type="number" step="0.01" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Unit Count</label>
                  <input type="number" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Classification Tag</label>
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase font-semibold">
                  <option value="fashion">Fashion</option>
                  <option value="mobile">Mobiles</option>
                  <option value="electronics">Electronics</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="sports">Sports Gear</option>
                  <option value="books">Books</option>
                  <option value="furniture">Furniture</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Static Image Asset Web URL</label>
                <input type="text" required value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" placeholder="https://example.com/item.jpg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Description Summary</label>
                <textarea rows="3" required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}