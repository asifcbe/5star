const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');

const buildOrderPayload = async ({ customerInfo, items, couponCode, paymentMethod }) => {
  if (!items || !items.length) throw new Error('Cart is empty');

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) throw new Error(`Product not available: ${item.productId}`);

    let price = product.price;
    let sku = product.sku;
    let variantId;
    let variantLabel;

    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error(`Selected option is no longer available for ${product.name}`);
      price = variant.price;
      sku = variant.sku || product.sku;
      variantId = variant._id;
      variantLabel = `${variant.name}: ${variant.value}`;
    }

    const quantity = item.quantity || 1;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      sku,
      brand: product.brand,
      variantId,
      variantLabel,
      price,
      quantity
    });
    subtotal += price * quantity;
  }

  let discount = 0;
  let appliedCouponCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) throw new Error('Invalid coupon code');
    if (!coupon.isActive) throw new Error('Coupon is not active');
    if (coupon.expiryDate < new Date()) throw new Error('Coupon has expired');
    if (subtotal < coupon.minOrderAmount) {
      throw new Error(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }
    discount = coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    appliedCouponCode = coupon.code;
  }

  const settings = await Settings.findOne();
  const shippingCharge = paymentMethod === 'cod'
    ? (settings?.codCharge ?? 100)
    : (settings?.shippingCharge ?? 0);

  const total = Math.max(subtotal - discount, 0) + shippingCharge;

  return {
    customerInfo,
    items: orderItems,
    subtotal,
    discount,
    shippingCharge,
    couponCode: appliedCouponCode,
    total,
    paymentMethod
  };
};

const persistOrder = async (payload, { user, paymentMethod, paymentStatus, orderStatus, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (payload.couponCode) {
    await Coupon.updateOne({ code: payload.couponCode }, { $inc: { usedCount: 1 } });
  }
  const order = await Order.create({
    ...payload,
    user: user?._id,
    paymentMethod,
    paymentStatus,
    orderStatus,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });
  return order.populate('user', 'name email');
};

const createOrder = async (req, res) => {
  try {
    const { customerInfo, items, couponCode, paymentMethod } = req.body;
    if (paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'Use the payment flow for online orders' });
    }
    const payload = await buildOrderPayload({ customerInfo, items, couponCode, paymentMethod });
    const order = await persistOrder(payload, {
      user: req.user,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'placed'
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Order.countDocuments(filter)
    ]);
    res.json({ orders, total, pages: Math.ceil(total / limitNum), page: pageNum });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderByOrderId = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrdersByPhone = async (req, res) => {
  try {
    const orders = await Order.find({ 'customerInfo.phone': { $regex: req.params.phone, $options: 'i' } })
      .select('-razorpaySignature -__v')
      .sort({ createdAt: -1 });
    if (!orders.length) return res.status(404).json({ message: 'No orders found for this phone number' });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.body.orderStatus) order.orderStatus = req.body.orderStatus;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All orders have been reset' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$total' } } }
    ]);
    const byStatusAgg = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    const byStatus = byStatusAgg.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});
    res.json({ total, revenue: revenueAgg[0]?.revenue || 0, byStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  buildOrderPayload,
  persistOrder,
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  getOrderByOrderId,
  getOrdersByPhone,
  updateOrderStatus,
  deleteOrder,
  resetAllOrders,
  getOrderStats
};
