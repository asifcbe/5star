const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  phone: { type: String },
  email: { type: String },
  timings: { type: String },
  googleMapLink: { type: String },
  googleMapEmbed: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  isComingSoon: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
