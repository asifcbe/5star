const Coupon = require('../models/Coupon');

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActiveCouponsForCheckout = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      showOnCheckout: true,
      expiryDate: { $gte: new Date() }
    }).select('code description discountType discountValue minOrderAmount maxDiscount expiryDate');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getExpiringCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      isActive: true,
      showOnCheckout: true,
      expiryDate: { $gte: new Date() }
    }).sort({ expiryDate: 1 });
    res.json(coupon || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: (code || '').toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is not active' });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}` });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    let discount = coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    res.json({ code: coupon.code, discount, discountType: coupon.discountType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const body = { ...req.body, code: (req.body.code || '').toUpperCase() };
    const coupon = await Coupon.create(body);
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Coupon code already exists' });
    res.status(500).json({ message: err.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.code) body.code = body.code.toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Coupon code already exists' });
    res.status(500).json({ message: err.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCoupons,
  getActiveCouponsForCheckout,
  getExpiringCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
