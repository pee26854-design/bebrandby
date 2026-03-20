import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";

export default function LogOut() {
  const navigate = useNavigate();
  const [cleared, setCleared] = useState(false);

  const handleLogOut = () => {
    logoutUser();
    localStorage.removeItem("bbb_user");
    localStorage.removeItem("bbb_orders");
    localStorage.removeItem("bbb_addresses");
    localStorage.removeItem("bbb_primary_address_id");
    localStorage.removeItem("bbb_last_order_id");
    setCleared(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded border space-y-4">
        <h1 className="text-2xl font-bold">Log Out</h1>
        <p className="text-gray-600">
          This will clear your local account data stored in the browser.
        </p>

        {!cleared ? (
          <div className="flex gap-2">
            <button
              onClick={handleLogOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Log Out
            </button>
            <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-green-700 font-medium">You are logged out.</div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/")} className="px-4 py-2 bg-pink-600 text-white rounded">
                Go Home
              </button>
              <button onClick={() => navigate("/account")} className="px-4 py-2 border rounded">
                Back to Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
