const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  sku: { type: String },
  brand: { type: String },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  variantLabel: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    notes: { type: String }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  couponCode: { type: String },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String }
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderId) {
    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const seq = await Counter.next(`order-${yymm}`);
    this.orderId = `${yymm}${String(seq).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
