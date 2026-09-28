/*
 * Creates the 9 Category documents (3 per product family) if missing.
 * Safe to re-run — skips any category whose slug already exists.
 *
 * Usage: node scripts/seedCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri } = require('../config/db');
const Category = require('../models/Category');
const DEFAULT_CATEGORIES = require('./categories');

async function main() {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  let created = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create({ ...cat, isActive: true });
      created++;
    }
  }
  console.log(`Created ${created} categories (${DEFAULT_CATEGORIES.length - created} already existed)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
