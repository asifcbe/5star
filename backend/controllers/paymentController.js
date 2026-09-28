const crypto = require('crypto');
const Razorpay = require('razorpay');
const { buildOrderPayload, persistOrder } = require('./orderController');
const Order = require('../models/Order');

const getRazorpayInstance = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { customerInfo, items, couponCode } = req.body;
    const payload = await buildOrderPayload({ customerInfo, items, couponCode, paymentMethod: 'razorpay' });

    const instance = getRazorpayInstance();
    const amountPaise = Math.round(payload.total * 100);
    const razorpayOrder = await instance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `fs_${Date.now()}`
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      customerInfo, items, couponCode
    } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: invalid signature' });
    }

    const existing = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) return res.status(200).json(existing);

    const payload = await buildOrderPayload({ customerInfo, items, couponCode, paymentMethod: 'razorpay' });

    const instance = getRazorpayInstance();
    const razorpayOrder = await instance.orders.fetch(razorpay_order_id);
    const expectedAmount = Math.round(payload.total * 100);
    if (razorpayOrder.amount_paid < expectedAmount) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    const order = await persistOrder(payload, {
      user: req.user,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    const instance = getRazorpayInstance();
    const payment = await instance.payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, getPaymentDetails };
