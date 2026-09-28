const mongoose = require('mongoose');

// A variant is one purchasable option of the product, e.g. { name: 'Colour', value: 'Charcoal' }
// or { name: 'Size', value: '55cm Cabin' }. Each variant carries its own price/stock/sku so
// customers pick a single option and the order snapshots that exact combination.
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  sku: { type: String, trim: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  // Top-level product family
  productType: {
    type: String,
    enum: ['bags', 'jerkins', 'trolleys'],
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'backpacks'
    // e.g. duffel-bags, laptop-bags, backpacks, leather-style-jerkins, rainproof-jerkins,
    //      winter-jerkins, cabin-trolleys, medium-trolleys, large-trolleys
  },
  brand: { type: String, required: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  stock: { type: Number, default: 0 },
  variants: [variantSchema],
  // Free-form spec fields relevant to bags / jerkins / trolleys
  material: { type: String },
  capacity: { type: String },   // e.g. "32 L", "55 cm / 38 L"
  color: { type: String },
  dimensions: { type: String },
  weight: { type: String },
  warranty: { type: String },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }]
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);
