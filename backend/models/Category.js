const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Which top-level product family this category belongs to: bags | jerkins | trolleys
  productType: { type: String, enum: ['bags', 'jerkins', 'trolleys'], default: 'bags' },
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
