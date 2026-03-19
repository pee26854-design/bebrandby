import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

// User pages
import Home from "./user/Home.jsx";
import About from "./user/AboutUs.jsx";
import Shop from "./user/Shop.jsx";
import Contact from "./user/ContactUs.jsx";
import Account from "./user/Account.jsx";
import MyAccount from "./user/MyAccount.jsx";
import MyAddresses from "./user/MyAddresses.jsx";
import Orders from "./user/Orders.jsx";
import ProductDetail from "./user/ProductDetail.jsx";
import Cart from "./user/Cart.jsx";
import Delivery from "./user/Delivery.jsx";
import Payment from "./user/Payment.jsx";
import LastOrder from "./user/LastOrder.jsx";
import LogOut from "./user/LogOut.jsx";
import Tracking from "./user/Tracking.jsx";

// Admin page
import Dashboard from "./admin/Dashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <Routes>
            {/* ===== User Routes ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
            <Route path="/personal-info" element={<MyAccount />} />
            <Route path="/my-addresses" element={<MyAddresses />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/last-order" element={<LastOrder />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/logout" element={<LogOut />} />

            {/* ===== Admin Routes ===== */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
