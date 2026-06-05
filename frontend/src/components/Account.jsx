import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Account() {
  const navigate = useNavigate();
  
  // Local states for app flow
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form States
  const [editForm, setEditForm] = useState({ name: "", phoneNumber: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Route guarding
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setEditForm({
        name: user.name || "",
        phoneNumber: user.phoneNumber || user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user, navigate]);

  const token = localStorage.getItem("token");

  // Helper alert message dismissals
  const triggerMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // HANDLERS
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Ensure your app's middleware reads this header
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        triggerMessage("success", "Profile updated successfully!");
      } else {
        const errText = await response.text();
        triggerMessage("error", errText || "Failed to update profile.");
      }
    } catch (err) {
      triggerMessage("error", "Network error. Try again later.");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerMessage("error", "New passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/api/users/profile/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        triggerMessage("success", "Password updated successfully!");
      } else {
        const errText = await response.text();
        triggerMessage("error", errText || "Failed to change password.");
      }
    } catch (err) {
      triggerMessage("error", "Network error. Try again later.");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-100 min-h-screen p-8">
     
        
         <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          {/* CATEGORY BAR */}
<div className="flex gap-3 overflow-x-auto mb-6 pb-2">
  <button
    onClick={() => navigate("/")}
   className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm whitespace-nowrap hover:bg-blue-700"
>
    Home
  </button>

 
</div>
        
        {/* HEADER & NOTIFICATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-4xl font-bold text-gray-800">👤 My Profile</h1>
          <div className="flex gap-3">
            {!isEditing && !isChangingPassword && (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold transition"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => setIsChangingPassword(true)} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl font-medium text-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* DYNAMIC MIDDLE SECTION */}
        
        {/* VIEW PROFILE MODE */}
        {!isEditing && !isChangingPassword && (
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div className="bg-gray-50 p-5 rounded-xl">
              <p className="font-semibold text-gray-500">Name</p>
              <h2 className="text-2xl font-bold mt-2 text-gray-800">{user.name}</h2>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl">
              <p className="font-semibold text-gray-500">Email (Username)</p>
              <h2 className="text-xl mt-2 text-gray-700">{user.email}</h2>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl">
              <p className="font-semibold text-gray-500">Phone</p>
              <h2 className="text-xl mt-2 text-gray-700">{user.phoneNumber || user.phone_number || "Not Available"}</h2>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl">
              <p className="font-semibold text-gray-500">Address</p>
              <h2 className="text-xl mt-2 text-gray-700">{user.address || "No dynamic address configured"}</h2>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODE */}
        {isEditing && (
          <form onSubmit={handleEditSubmit} className="bg-gray-50 p-6 rounded-2xl max-w-2xl border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">Modify Account Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-2">Full Name</label>
                <input 
                  type="text" required value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-2">Phone Number</label>
                <input 
                  type="text" value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-2">Shipping Address</label>
                <textarea 
                  rows="3" value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold">Save Info</button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2.5 rounded-xl font-bold">Cancel</button>
            </div>
          </form>
        )}

        {/* CHANGE PASSWORD MODE */}
        {isChangingPassword && (
          <form onSubmit={handleChangePasswordSubmit} className="bg-gray-50 p-6 rounded-2xl max-w-2xl border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-purple-700">Update Encryption Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-2">Current Password</label>
                <input 
                  type="password" required value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-2">New Password</label>
                <input 
                  type="password" required value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-2">Confirm New Password</label>
                <input 
                  type="password" required value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold">Update Password</button>
              <button type="button" onClick={() => {
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2.5 rounded-xl font-bold">Cancel</button>
            </div>
          </form>
        )}

        {/* QUICK LINK DASHBOARD BUTTONS */}
        {!isEditing && !isChangingPassword && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Link to="/Cart" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl text-center font-bold text-2xl shadow">
              🛒<br />My Cart
            </Link>
            <Link to="/Wishlist" className="bg-pink-500 hover:bg-pink-600 text-white p-6 rounded-2xl text-center font-bold text-2xl shadow">
              ❤️<br />Wishlist
            </Link>
            <Link to="/orders" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl text-center font-bold text-2xl shadow">
              📦<br />Orders
            </Link>
          </div>
        )}

        {/* LOGOUT BUTTON */}
        <div className="mt-12 border-t pt-6 flex justify-between items-center">
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow transition">
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}