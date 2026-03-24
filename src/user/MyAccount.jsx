import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, getAuthHeaders, getCurrentUser } from "../utils/auth";

export default function MyAccount() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({ name: "", phone: "", email: "" });

  async function loadProfile() {
    const latestUser = getCurrentUser();
    setCurrentUser(latestUser);
    if (!latestUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/me`, { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Failed to load profile");
        setUser({
          name: latestUser.name || "",
          phone: latestUser.phone || "",
          email: latestUser.email || "",
        });
        return;
      }
      setUser({
        name: data.data?.name || "",
        phone: data.data?.phone || "",
        email: data.data?.email || "",
      });
      setError("");
    } catch (err) {
      setError("Failed to load profile");
      setUser({
        name: latestUser?.name || "",
        phone: latestUser?.phone || "",
        email: latestUser?.email || "",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile() {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Failed to save profile");
        return;
      }
      setEditing(false);
      setError("");
    } catch {
      setError("Failed to save profile");
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold mb-2 font-brand">Personal Information</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your personal information.</p>
          <Link to="/" className="px-4 py-2 bg-rose-600 text-white rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          Loading profile data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white shadow-sm">
          <div
            className="p-6 text-white"
            style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">BeBrandBy</div>
                <h1 className="text-3xl md:text-4xl font-bold font-brand">Personal Information</h1>
                <p className="text-white/90 text-sm mt-2">Update your personal profile details.</p>
              </div>
              <div className="bg-white/15 px-4 py-2 rounded-lg text-sm">
                {user.name} | {user.email}
              </div>
            </div>
          </div>
          <div className="p-6 bg-white">
            {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Full Name</label>
                <input
                  value={user.name}
                  onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
                  disabled={!editing}
                  className={`w-full mt-1 border rounded-lg px-3 py-2 ${
                    editing ? "border-rose-200" : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Phone</label>
                <input
                  value={user.phone}
                  onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
                  disabled={!editing}
                  className={`w-full mt-1 border rounded-lg px-3 py-2 ${
                    editing ? "border-rose-200" : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  value={user.email}
                  onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
                  disabled={!editing}
                  className={`w-full mt-1 border rounded-lg px-3 py-2 ${
                    editing ? "border-rose-200" : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={loadProfile}
                className="px-3 py-1 border border-rose-200 rounded-lg text-sm"
              >
                Refresh
              </button>
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 border border-rose-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/account" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
            <div className="text-sm text-gray-500">My Account</div>
            <div className="font-semibold mt-1">View account overview</div>
          </Link>
          <Link to="/my-addresses" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
            <div className="text-sm text-gray-500">My Addresses</div>
            <div className="font-semibold mt-1">Manage saved addresses</div>
          </Link>
          <Link to="/orders" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
            <div className="text-sm text-gray-500">Orders</div>
            <div className="font-semibold mt-1">View all orders</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
