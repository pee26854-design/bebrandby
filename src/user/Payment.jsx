import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import productsData from "../data/products";
import { getAuthHeaders, getCurrentUser } from "../utils/auth";

const CART_KEY = "bbb_cart";
const DELIVERY_KEY = "bbb_delivery";
const ORDERS_KEY = "bbb_orders";
const LAST_ORDER_KEY = "bbb_last_order_id";
const EMAIL_API_URL = "https://bebrandby-backend.onrender.com/api";
const ORDER_API_URL = "https://bebrandby-backend.onrender.com/api";

function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function loadDelivery(fallback) {
  if (fallback) return fallback;
  const raw = localStorage.getItem(DELIVERY_KEY);
  return raw ? JSON.parse(raw) : null;
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const delivery = loadDelivery(location.state?.delivery || null);
  const currentUser = getCurrentUser();

  const [method, setMethod] = useState("deposit"); // deposit | cod
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [slip, setSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [payerName, setPayerName] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [paidTime, setPaidTime] = useState("");

  const cartItems = loadCart();
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, it) => {
      const product = productsData.find((p) => p.id === it.productId);
      return sum + (product?.price || 0) * (it.qty || 1);
    }, 0);
  }, [cartItems]);
  const depositAmount = useMemo(() => totalPrice * 0.4, [totalPrice]);
  const remainingAmount = useMemo(() => totalPrice - depositAmount, [totalPrice, depositAmount]);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!delivery) {
      alert("Delivery information missing");
      return;
    }
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!slip) {
      alert("Please upload deposit transfer slip");
      return;
    }
    if (!payerName.trim()) {
      alert("Please enter payer name");
      return;
    }
    if (!paidDate) {
      alert("Please select payment date");
      return;
    }
    if (!paidTime) {
      alert("Please select payment time from slip");
      return;
    }

    setProcessing(true);
    const orderId = `ORD-${Date.now()}`;
    const orderItems = cartItems.map((it) => {
      const product = productsData.find((p) => p.id === it.productId);
      return {
        name: product?.name || "Unknown",
        qty: it.qty || 1,
        price: product?.price || 0,
      };
    });

    const apiPayload = {
      items: cartItems.map((it) => ({ productId: it.productId, qty: it.qty })),
      delivery,
      payment: {
        method: "deposit",
        depositAmount,
        remainingAmount,
        transferInfo: {
          payerName: payerName.trim(),
          paidDate,
          paidTime,
        },
      },
    };

    const orderRes = await fetch(ORDER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(apiPayload),
    });
    const orderData = await orderRes.json();
    if (!orderData.ok) {
      alert("Failed to create order");
      setProcessing(false);
      return;
    }

    const localOrderId = `ORD-${orderData.orderId}`;
    const localStatus = orderData.status || (method === "deposit" ? "Deposit Paid" : "Processing");
    const localOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    localOrders.unshift({
      id: localOrderId,
      total: totalPrice,
      status: localStatus,
      date: new Date().toLocaleString(),
      items: orderItems,
      shipping: delivery?.shippingMethod || "standard",
      tracking: "-",
      payerName: payerName.trim(),
      paidDate,
      paidTime,
    });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(localOrders.slice(0, 20)));
    localStorage.setItem(LAST_ORDER_KEY, localOrderId);
    localStorage.removeItem(CART_KEY);

    if (currentUser?.email) {
      fetch(EMAIL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          toEmail: currentUser.email,
          name: currentUser.name,
          orderId: localOrderId,
          totalPrice,
          depositAmount,
          remainingAmount,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 600);
  }

  function handleSlipChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSlip(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSlip(null);
      setSlipPreview(null);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-3">Order confirmed</h2>
          <p className="text-gray-600 mb-4">
            Deposit received. We will notify you to pay the remaining amount.
          </p>
          <div className="flex gap-3">
            <Link to="/" className="px-4 py-2 bg-pink-600 text-white rounded">
              Go Home
            </Link>
            <Link to="/orders" className="px-4 py-2 border rounded">
              View last order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-3">Payment</h2>
          <p className="text-gray-600 mb-4">Delivery information is missing. Please start from cart.</p>
          <Link to="/cart" className="px-4 py-2 bg-pink-600 text-white rounded">
            Go to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded border">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/delivery" className="text-sm text-pink-600">
            Back
          </Link>
          <h1 className="text-xl font-semibold">Payment</h1>
        </div>

        {!currentUser && (
          <div className="mb-4 text-sm text-red-600">
            You are checking out as guest. Login is optional.
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600">
          <div>
            Deliver to: <span className="font-medium">{delivery.address?.label}</span>
          </div>
          <div className="mt-1">{delivery.address?.text}</div>
          <div className="mt-1">Method: {delivery.shippingMethod}</div>
          <div className="mt-1">Total: ฿{totalPrice.toFixed(2)}</div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded space-y-2">
            <div className="text-sm text-gray-600">Deposit payment (40% of total)</div>
            <div className="text-sm">
              Total: <span className="font-medium">฿{totalPrice.toFixed(2)}</span>
            </div>
            <div className="text-sm">
              Deposit due now: <span className="font-semibold text-pink-600">฿{depositAmount.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Remaining: ฿{remainingAmount.toFixed(2)} (We will notify you to pay the remaining amount)
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="mb-2 text-sm text-gray-600">Bank transfer details</div>
            <div className="text-center space-y-1 text-sm">
              <p>Bank: Bangkok Bank</p>
              <p>Account number: 090-0-05781-5</p>
              <p>Account name: BeBrandBy</p>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm mb-1">Name on slip</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Payment date</label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Payment time (use time from slip)</label>
                  <input
                    type="time"
                    value={paidTime}
                    onChange={(e) => setPaidTime(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <label className="block text-sm mb-1">Upload deposit slip</label>
              <input type="file" accept="image/*" onChange={handleSlipChange} />
              {slipPreview && (
                <div className="mt-3 flex items-center justify-center">
                  <img src={slipPreview} alt="slip preview" className="max-h-48 object-contain border rounded" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button onClick={handlePlaceOrder} disabled={processing} className="px-4 py-2 bg-pink-600 text-white rounded">
              {processing ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
