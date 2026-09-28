const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: '5Star' },
  storeTagline: { type: String, default: 'Bags, Jerkins & Trolleys — Built to Travel.' },
  logo: { type: String },
  storeEmail: { type: String, default: 'support@fivestar.example.com' },
  storePhone: { type: String, default: '+91 XXXXXXXXXX' },
  storeAddress: { type: String },
  codEnabled: { type: Boolean, default: true },
  razorpayKeyId: { type: String, default: 'rzp_test_dummyKeyId1234' },
  socialLinks: {
    instagram: String,
    facebook: String,
    whatsapp: String,
    youtube: String
  },
  metaDescription: { type: String, default: '5Star - Premium bags, jerkins and trolleys for every journey.' },
  favicon: { type: String },
  shippingCharge: { type: Number, default: 0 },
  codCharge: { type: Number, default: 100 },
  theme: { type: String, default: 'gold-white' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
