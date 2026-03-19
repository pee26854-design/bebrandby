const express = require("express");
const sgMail = require("@sendgrid/mail");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const API_KEY = process.env.SENDGRID_API_KEY;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

router.post("/notify-deposit", authRequired, async (req, res) => {
  try {
    const { toEmail, name, orderId, totalPrice, depositAmount, remainingAmount } = req.body || {};
    if (!toEmail || !orderId) {
      return res.status(400).json({ ok: false, message: "Missing toEmail or orderId" });
    }
    if (!FROM_EMAIL || !API_KEY) {
      return res.status(500).json({ ok: false, message: "Email server not configured" });
    }

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: `Deposit received for order ${orderId}`,
      text:
        `Hi ${name || "customer"},\n\n` +
        `We have received your deposit for order ${orderId}.\n` +
        `Total: ฿${Number(totalPrice || 0).toFixed(2)}\n` +
        `Deposit paid: ฿${Number(depositAmount || 0).toFixed(2)}\n` +
        `Remaining: ฿${Number(remainingAmount || 0).toFixed(2)}\n\n` +
        `We will notify you again to pay the remaining amount.\n\n` +
        `BeBrandBy`,
      html:
        `<p>Hi ${name || "customer"},</p>` +
        `<p>We have received your deposit for order <strong>${orderId}</strong>.</p>` +
        `<p>Total: <strong>฿${Number(totalPrice || 0).toFixed(2)}</strong><br/>` +
        `Deposit paid: <strong>฿${Number(depositAmount || 0).toFixed(2)}</strong><br/>` +
        `Remaining: <strong>฿${Number(remainingAmount || 0).toFixed(2)}</strong></p>` +
        `<p>We will notify you again to pay the remaining amount.</p>` +
        `<p>BeBrandBy</p>`,
    };

    await sgMail.send(msg);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to send email" });
  }
});

module.exports = router;
