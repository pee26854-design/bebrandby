import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../utils/auth";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/shop", label: "Shop" },
    { to: "/tracking", label: "Tracking" },
    { to: "/contact", label: "Contact Us" },
  ];

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const usernameOrEmail = e.target.loginName.value.trim();
    const password = e.target.loginPassword.value;
    const res = await loginUser({ usernameOrEmail, password });
    if (!res.ok) {
      setAuthError(res.message);
      return;
    }
    setCurrentUser(res.user);
    setAuthError("");
    setShowLogin(false);
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();

    const payload = {
      name: e.target.regName.value,
      username: e.target.regUsername.value,
      email: e.target.regEmail.value,
      phone: e.target.regPhone.value,
      password: e.target.regPassword.value,
      confirm: e.target.regPasswordConfirm.value,
    };

    if (payload.password !== payload.confirm) {
      setAuthError("Passwords do not match");
      return;
    }

    const res = await registerUser(payload);
    if (!res.ok) {
      setAuthError(res.message);
      return;
    }
    setCurrentUser(res.user);
    setAuthError("");
    setShowRegister(false);
  }

  function handleLogOut() {
    logoutUser();
    setCurrentUser(null);
    setShowDropdown(false);
    navigate("/logout");
  }

  return (
    <header className="bg-pink-300 relative z-50">
      <div className="max-w-6xl mx-auto flex items-center gap-6 p-4">
        {/* Logo + Search */}
        <div className="flex items-center gap-4 w-1/3">
          <Link to="/" className="text-white font-semibold">
            BeBrandBy
          </Link>

          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600">
              🔍
            </span>
            <input
              placeholder="Search"
              className="w-full rounded-full px-10 py-2 outline-none bg-white/90"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="flex justify-center gap-6 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`text-white/90 hover:text-white ${
                    isActive(l.to)
                      ? "underline decoration-2 underline-offset-4"
                      : ""
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right actions */}
        <div className="w-1/6 flex justify-end items-center gap-3 text-white relative">
          {!currentUser && (
            <>
              <button
                onClick={() => setShowRegister(true)}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Register
              </button>

              <button
                onClick={() => setShowLogin(true)}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Login
              </button>
            </>
          )}

          {currentUser && (
            <div
              className="relative cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="material-icons">person</span>
              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg w-48 z-50">
                  <div className="p-4 border-b">
                    <p className="font-semibold">{currentUser.name}</p>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                  </div>
                  <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <Link to="/account">My Account</Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <Link to="/personal-info">Personal Information</Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <Link to="/my-addresses">My Addresses</Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <Link to="/last-order">Last Order</Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <Link to="/tracking">Tracking</Link>
                    </li>
                    {currentUser.role === "admin" && (
                      <>
                        <li className="px-4 py-2 hover:bg-gray-100">
                          <Link to="/admin/dashboard">Admin Dashboard</Link>
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-100">
                        </li>
                      </>
                    )}
                    <li className="px-4 py-2 hover:bg-gray-100">
                      <button onClick={handleLogOut}>Log Out</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <Link to="/cart" className="p-2 rounded hover:bg-white/20">
            🛒
          </Link>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 text-white" style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}>
              <h3 className="text-xl font-semibold">Welcome Back</h3>
              <p className="text-sm text-white/90">Login to continue shopping</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {authError && <div className="text-sm text-red-600">{authError}</div>}

              <div>
                <label className="text-xs text-gray-500">Username or Email</label>
                <input
                  name="loginName"
                  placeholder="yourname or you@email.com"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Password</label>
                <input
                  name="loginPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Remember me
                </label>
                <button type="button" className="text-pink-600 hover:underline">
                  Forgot password?
                </button>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 text-white px-4 py-2 rounded" style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}>
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 border px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                New here?{" "}
                <button type="button" onClick={() => { setShowLogin(false); setShowRegister(true); }} className="text-pink-600 hover:underline">
                  Create an account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 text-white" style={{ background: "linear-gradient(90deg, #EA3E5B 0%, #FAC09F 100%)" }}>
              <h3 className="text-xl font-semibold">Create Account</h3>
              <p className="text-sm text-white/90">Join BeBrandBy for faster checkout</p>
            </div>
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              {authError && <div className="text-sm text-red-600">{authError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <input name="regName" placeholder="Full Name" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Username</label>
                  <input name="regUsername" placeholder="Username" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <input name="regEmail" type="email" placeholder="Email" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <input name="regPhone" placeholder="Phone" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Password</label>
                  <input name="regPassword" type="password" placeholder="Password" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Confirm Password</label>
                  <input name="regPasswordConfirm" type="password" placeholder="Confirm Password" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" required />
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-500">
                <input type="checkbox" required />
                I agree to the Terms and Privacy Policy.
              </label>

              <div className="flex gap-2">
                <button className="flex-1 text-white px-4 py-2 rounded" style={{ background: "linear-gradient(90deg, #EA3E5B 0%, #FAC09F 100%)" }}>
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="flex-1 border px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Already have an account?{" "}
                <button type="button" onClick={() => { setShowRegister(false); setShowLogin(true); }} className="text-pink-600 hover:underline">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
