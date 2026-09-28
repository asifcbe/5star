/*
 * Seeds representative dummy data across every model so the storefront and
 * admin panel can be exercised end-to-end (products with and without variants,
 * every product family / category, coupons, branches, landing content, and a
 * handful of orders in different states). Safe to re-run — it clears prior
 * dummy data (matched by SKU / coupon code / branch name / customer email)
 * before reseeding, and never touches real user accounts.
 *
 * Product images point at the bundled sample images served by the backend at
 * /assets/... (from 5Star/assets). getImageUrl() on the frontend prefixes
 * relative paths with the API base URL, so these resolve without any uploads.
 *
 * Usage: node scripts/seedDummyData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri } = require('../config/db');

const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Branch = require('../models/Branch');
const Category = require('../models/Category');
const LandingContent = require('../models/LandingContent');
const Settings = require('../models/Settings');
const Counter = require('../models/Counter');
const DEFAULT_CATEGORIES = require('./categories');

const DUMMY_TAG = 'seed-dummy';
const img = (p) => `/assets/${p}`;

// ── PRODUCTS ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ===== BAGS · Backpacks =====
  {
    name: 'Campus Elite Backpack',
    description: 'A structured 26 L campus backpack with a padded 15.6" laptop sleeve, quick-access front organiser, and breathable air-mesh back panel for all-day comfort between lectures.',
    productType: 'bags', category: 'backpacks', brand: '5Star Urban', sku: 'FS-BP-CAMPUS',
    price: 2199, mrp: 2999, stock: 48, material: 'Water-resistant polyester', capacity: '26 L',
    color: 'Graphite', dimensions: '45 × 30 × 18 cm', weight: '0.72 kg', warranty: '2 years',
    featured: true, isActive: true,
    images: [img('bags/backpacks/five-star-campus-elite-backpack-primary.png')],
    tags: ['best-seller', 'laptop', 'student']
  },
  {
    name: 'MetroFlex Everyday Backpack',
    description: 'A slim everyday carry with a flexible expandable main compartment, hidden anti-theft back pocket, and a luggage pass-through strap for travel days.',
    productType: 'bags', category: 'backpacks', brand: '5Star Urban', sku: 'FS-BP-METROFLEX',
    price: 1899, mrp: 2499, stock: 60, material: 'Ripstop nylon', capacity: '20–24 L',
    color: 'Black', dimensions: '43 × 29 × 14 cm', weight: '0.6 kg', warranty: '1 year',
    featured: false, isActive: true,
    images: [img('bags/backpacks/five-star-metroflex-everyday-backpack-primary.png')],
    tags: ['everyday', 'anti-theft']
  },
  {
    name: 'Trailblazer Travel Backpack',
    description: 'A 40 L cabin-friendly travel backpack that opens flat like a suitcase, with compression straps, a shoe compartment, and stowable harness for check-in.',
    productType: 'bags', category: 'backpacks', brand: '5Star Voyage', sku: 'FS-BP-TRAILBLAZER',
    price: 3799, mrp: 4999, stock: 30, material: '900D recycled polyester', capacity: '40 L',
    color: 'Olive', dimensions: '52 × 34 × 22 cm', weight: '1.25 kg', warranty: '3 years',
    featured: true, isActive: true,
    images: [img('bags/backpacks/five-star-trailblazer-travel-backpack-primary.png')],
    tags: ['travel', 'cabin-size', 'best-seller']
  },
  {
    name: 'Urban Explorer Backpack',
    description: 'A city-ready roll-top backpack with a magnetic buckle closure, felt-lined tablet pocket, and weatherproof base for unpredictable commutes.',
    productType: 'bags', category: 'backpacks', brand: '5Star Urban', sku: 'FS-BP-EXPLORER',
    price: 2499, mrp: 3299, stock: 25, material: 'Coated canvas', capacity: '18–22 L',
    color: 'Sand', dimensions: '46 × 28 × 15 cm', weight: '0.85 kg', warranty: '2 years',
    featured: false, isActive: true,
    images: [img('bags/backpacks/five-star-urban-explorer-backpack-primary.png')],
    tags: ['roll-top', 'commute']
  },
  {
    name: 'Voyager Pro Backpack',
    description: 'A premium 30 L professional backpack with a clamshell tech compartment, RFID-blocking pocket, dedicated power-bank sleeve, and YKK zippers throughout.',
    productType: 'bags', category: 'backpacks', brand: '5Star Pro', sku: 'FS-BP-VOYAGERPRO',
    stock: 0, price: 3299,
    variants: [
      { name: 'Colour', value: 'Charcoal', sku: 'FS-BP-VOYAGERPRO-CHR', price: 3299, stock: 22 },
      { name: 'Colour', value: 'Navy', sku: 'FS-BP-VOYAGERPRO-NVY', price: 3299, stock: 14 },
      { name: 'Colour', value: 'All Black', sku: 'FS-BP-VOYAGERPRO-BLK', price: 3499, stock: 9 }
    ],
    material: 'Ballistic nylon', capacity: '30 L', dimensions: '48 × 32 × 20 cm', weight: '1.1 kg',
    warranty: '5 years', featured: true, isActive: true,
    images: [img('bags/backpacks/five-star-voyager-pro-backpack-primary.png')],
    tags: ['premium', 'business', 'rfid']
  },

  // ===== BAGS · Laptop Bags =====
  {
    name: 'Business Traveller Laptop Bag',
    description: 'A sharp briefcase-style laptop bag for 15.6" machines, with a trolley strap, document divider, and a wipe-clean lining that shrugs off spilled coffee.',
    productType: 'bags', category: 'laptop-bags', brand: '5Star Pro', sku: 'FS-LB-BIZTRAVEL',
    price: 2699, mrp: 3499, stock: 34, material: 'PU leather & nylon', capacity: '12 L',
    color: 'Brown', dimensions: '41 × 30 × 8 cm', weight: '0.9 kg', warranty: '2 years',
    featured: true, isActive: true,
    images: [img('bags/laptop-bags/five-star-business-traveller-laptop-bag-primary.png')],
    tags: ['business', 'trolley-strap', 'best-seller']
  },
  {
    name: 'Executive Laptop Bag',
    description: 'A full-grain-look executive bag with a structured shell, felt-lined 16" laptop bay, brushed-metal hardware, and a detachable padded shoulder strap.',
    productType: 'bags', category: 'laptop-bags', brand: '5Star Pro', sku: 'FS-LB-EXECUTIVE',
    price: 3499, mrp: 4599, stock: 18, material: 'Vegan leather', capacity: '14 L',
    color: 'Tan', dimensions: '42 × 31 × 10 cm', weight: '1.05 kg', warranty: '3 years',
    featured: false, isActive: true,
    images: [img('bags/laptop-bags/five-star-executive-laptop-bag-primary.png')],
    tags: ['executive', 'premium']
  },
  {
    name: 'OfficePro Laptop Messenger',
    description: 'A lightweight messenger for the daily office run — flap closure with silent magnetic catches, quick-grab phone loop, and a slim 14" padded sleeve.',
    productType: 'bags', category: 'laptop-bags', brand: '5Star Urban', sku: 'FS-LB-OFFICEPRO',
    price: 1799, mrp: 2299, stock: 52, material: 'Recycled polyester', capacity: '10 L',
    color: 'Grey', dimensions: '38 × 28 × 7 cm', weight: '0.55 kg', warranty: '1 year',
    featured: false, isActive: true,
    images: [img('bags/laptop-bags/five-star-officepro-laptop-messenger-primary.png')],
    tags: ['messenger', 'lightweight']
  },
  {
    name: 'Slimline Laptop Sleeve Bag',
    description: 'A minimalist carry-in-hand sleeve with a fleece interior, a slot for chargers and cables, and a soft grab handle. Fits most 13–14" laptops.',
    productType: 'bags', category: 'laptop-bags', brand: '5Star Urban', sku: 'FS-LB-SLIMLINE',
    stock: 0, price: 999,
    variants: [
      { name: 'Size', value: '13-inch', sku: 'FS-LB-SLIMLINE-13', price: 999, stock: 40 },
      { name: 'Size', value: '14-inch', sku: 'FS-LB-SLIMLINE-14', price: 1099, stock: 33 },
      { name: 'Size', value: '16-inch', sku: 'FS-LB-SLIMLINE-16', price: 1249, stock: 21 }
    ],
    material: 'Neoprene', capacity: '3 L', weight: '0.25 kg', warranty: '1 year',
    featured: true, isActive: true,
    images: [img('bags/laptop-bags/five-star-slimline-laptop-sleeve-bag-primary.png')],
    tags: ['sleeve', 'minimal', 'best-seller']
  },
  {
    name: 'TechGuard Laptop Backpack',
    description: 'A protective laptop backpack with a suspended shock-absorbing laptop cradle, hard-shell top pocket for sunglasses, and weatherproof zippers.',
    productType: 'bags', category: 'laptop-bags', brand: '5Star Pro', sku: 'FS-LB-TECHGUARD',
    price: 2999, mrp: 3899, stock: 27, material: '600D polyester', capacity: '22 L',
    color: 'Black', dimensions: '46 × 31 × 19 cm', weight: '0.95 kg', warranty: '3 years',
    featured: false, isActive: true,
    images: [img('bags/laptop-bags/five-star-techguard-laptop-backpack-primary.png')],
    tags: ['protective', 'commute']
  },

  // ===== BAGS · Duffel Bags =====
  {
    name: 'ActiveFit Gym Duffel',
    description: 'A 35 L gym duffel with a ventilated shoe tunnel, a zip-out wet pocket for towels, and a water-bottle holster. Built for the daily locker-room shuffle.',
    productType: 'bags', category: 'duffel-bags', brand: '5Star Active', sku: 'FS-DF-ACTIVEFIT',
    price: 1599, mrp: 2099, stock: 65, material: 'Rip-stop polyester', capacity: '35 L',
    color: 'Black/Red', dimensions: '55 × 28 × 28 cm', weight: '0.8 kg', warranty: '1 year',
    featured: true, isActive: true,
    images: [img('bags/duffel-bags/five-star-activefit-gym-duffel-primary.png')],
    tags: ['gym', 'shoe-pocket', 'best-seller']
  },
  {
    name: 'Compact Carry Duffel',
    description: 'A grab-and-go 24 L weekend duffel that folds into its own pocket when empty — perfect as a packable spare bag for trips.',
    productType: 'bags', category: 'duffel-bags', brand: '5Star Voyage', sku: 'FS-DF-COMPACT',
    price: 1199, mrp: 1599, stock: 70, material: 'Ripstop nylon', capacity: '24 L',
    color: 'Teal', dimensions: '48 × 24 × 24 cm', weight: '0.4 kg', warranty: '1 year',
    featured: false, isActive: true,
    images: [img('bags/duffel-bags/five-star-compact-carry-duffel-primary.png')],
    tags: ['packable', 'weekend']
  },
  {
    name: 'Heritage Premium Duffel',
    description: 'A waxed-canvas and leather-trim duffel with solid antique-brass hardware, a full-length brass zipper, and a cotton-twill lining. Ages beautifully.',
    productType: 'bags', category: 'duffel-bags', brand: '5Star Heritage', sku: 'FS-DF-HERITAGE',
    price: 4499, mrp: 5999, stock: 16, material: 'Waxed canvas & leather', capacity: '42 L',
    color: 'Field Tan', dimensions: '58 × 30 × 30 cm', weight: '1.6 kg', warranty: '5 years',
    featured: true, isActive: true,
    images: [img('bags/duffel-bags/five-star-heritage-premium-duffel-primary.png')],
    tags: ['premium', 'leather', 'heritage']
  },
  {
    name: 'Voyager Travel Duffel',
    description: 'A 50 L wheeled-look travel duffel with backpack straps, a lockable main zip, and grab handles on every side for wrestling it into overhead bins.',
    productType: 'bags', category: 'duffel-bags', brand: '5Star Voyage', sku: 'FS-DF-VOYAGER',
    price: 2799, mrp: 3699, stock: 28, material: '900D polyester', capacity: '50 L',
    color: 'Navy', dimensions: '62 × 32 × 32 cm', weight: '1.1 kg', warranty: '3 years',
    featured: false, isActive: true,
    images: [img('bags/duffel-bags/five-star-voyager-travel-duffel-primary.png')],
    tags: ['travel', 'convertible']
  },
  {
    name: 'Weekender Duffel Bag',
    description: 'A smart 38 L weekender with a structured base, a suit-friendly flat pocket, and a trolley sleeve so it rides on top of your cabin trolley.',
    productType: 'bags', category: 'duffel-bags', brand: '5Star Voyage', sku: 'FS-DF-WEEKENDER',
    stock: 0, price: 2299,
    variants: [
      { name: 'Colour', value: 'Charcoal', sku: 'FS-DF-WEEKENDER-CHR', price: 2299, stock: 24 },
      { name: 'Colour', value: 'Cognac', sku: 'FS-DF-WEEKENDER-CGN', price: 2499, stock: 12 }
    ],
    material: 'Coated canvas & PU trim', capacity: '38 L', dimensions: '54 × 28 × 28 cm',
    weight: '0.95 kg', warranty: '2 years', featured: true, isActive: true,
    images: [img('bags/duffel-bags/five-star-weekender-duffel-bag-primary.png')],
    tags: ['weekend', 'trolley-sleeve', 'best-seller']
  },

  // ===== JERKINS · Leather-Style =====
  {
    name: 'Classic Rider Jerkin',
    description: 'A timeless biker-cut jerkin in supple leather-look PU with asymmetric zip, quilted shoulders, and a removable thermal lining for shoulder-season riding.',
    productType: 'jerkins', category: 'leather-style-jerkins', brand: '5Star Ride', sku: 'FS-JK-CLASSICRIDER',
    stock: 0, price: 3999,
    variants: [
      { name: 'Size', value: 'S', sku: 'FS-JK-CLASSICRIDER-S', price: 3999, stock: 10 },
      { name: 'Size', value: 'M', sku: 'FS-JK-CLASSICRIDER-M', price: 3999, stock: 18 },
      { name: 'Size', value: 'L', sku: 'FS-JK-CLASSICRIDER-L', price: 3999, stock: 15 },
      { name: 'Size', value: 'XL', sku: 'FS-JK-CLASSICRIDER-XL', price: 4199, stock: 8 },
      { name: 'Size', value: 'XXL', sku: 'FS-JK-CLASSICRIDER-XXL', price: 4399, stock: 0 }
    ],
    material: 'Leather-look PU', color: 'Black', warranty: '1 year',
    featured: true, isActive: true,
    images: [img('jerkins/leather-style-jerkins/five-star-classic-rider-jerkin-primary.png')],
    tags: ['biker', 'best-seller', 'removable-liner']
  },
  {
    name: 'Executive Leather-Style Jerkin',
    description: 'A clean, collarless leather-style jerkin cut for the office-to-evening crowd — matte finish, hidden placket, and a soft viscose lining.',
    productType: 'jerkins', category: 'leather-style-jerkins', brand: '5Star Heritage', sku: 'FS-JK-EXECUTIVE',
    price: 4599, mrp: 5999, stock: 22, material: 'Premium PU leather', color: 'Espresso',
    warranty: '2 years', featured: false, isActive: true,
    images: [img('jerkins/leather-style-jerkins/five-star-executive-leather-style-jerkin-primary.png')],
    tags: ['smart-casual', 'premium']
  },
  {
    name: 'Heritage Leather-Style Jerkin',
    description: 'A vintage-wash leather-style jerkin with contrast stitching, a corduroy collar, and antique press studs. Distressed on purpose, built to last.',
    productType: 'jerkins', category: 'leather-style-jerkins', brand: '5Star Heritage', sku: 'FS-JK-HERITAGE',
    price: 4299, mrp: 5499, stock: 19, material: 'Vintage-wash PU', color: 'Brown',
    warranty: '2 years', featured: true, isActive: true,
    images: [img('jerkins/leather-style-jerkins/five-star-heritage-leather-style-jerkin-primary.png')],
    tags: ['vintage', 'heritage']
  },
  {
    name: 'Roadmaster Biker Jerkin',
    description: 'A protective touring jerkin with CE-rated shoulder and elbow pockets, abrasion-resistant panels, reflective piping, and a full mesh liner for airflow.',
    productType: 'jerkins', category: 'leather-style-jerkins', brand: '5Star Ride', sku: 'FS-JK-ROADMASTER',
    price: 5499, mrp: 6999, stock: 14, material: 'PU leather with armour pockets', color: 'Black/Grey',
    warranty: '2 years', featured: false, isActive: true,
    images: [img('jerkins/leather-style-jerkins/five-star-roadmaster-biker-jerkin-primary.png')],
    tags: ['touring', 'protective', 'reflective']
  },
  {
    name: 'Urban Edge Leather-Style Jerkin',
    description: 'A slim streetwear jerkin with a stand collar, ribbed cuffs and hem, twin zip chest pockets, and a lightweight unlined body for layering.',
    productType: 'jerkins', category: 'leather-style-jerkins', brand: '5Star Urban', sku: 'FS-JK-URBANEDGE',
    price: 3499, mrp: 4499, stock: 30, material: 'Soft PU leather', color: 'Jet Black',
    warranty: '1 year', featured: true, isActive: true,
    images: [img('jerkins/leather-style-jerkins/five-star-urban-edge-leather-style-jerkin-primary.png')],
    tags: ['streetwear', 'slim-fit', 'best-seller']
  },

  // ===== JERKINS · Rainproof =====
  {
    name: 'AquaBlock Travel Jerkin',
    description: 'A packable rainproof jerkin with fully taped seams, a stowaway hood, storm cuffs, and a stuff pocket that doubles as a travel pillow.',
    productType: 'jerkins', category: 'rainproof-jerkins', brand: '5Star Voyage', sku: 'FS-JK-AQUABLOCK',
    price: 2499, mrp: 3299, stock: 44, material: 'Ripstop nylon, 10K waterproof', color: 'Slate',
    warranty: '2 years', featured: true, isActive: true,
    images: [img('jerkins/rainproof-jerkins/five-star-aquablock-travel-jerkin-primary.png')],
    tags: ['packable', 'taped-seams', 'best-seller']
  },
  {
    name: 'Monsoon Guard Jerkin',
    description: 'A heavy-duty monsoon jerkin with a double storm flap, drawcord hem, high collar, and a bright inner lining for low-light visibility.',
    productType: 'jerkins', category: 'rainproof-jerkins', brand: '5Star Ride', sku: 'FS-JK-MONSOONGUARD',
    price: 2199, mrp: 2899, stock: 50, material: 'PVC-coated polyester, 15K waterproof', color: 'Yellow',
    warranty: '1 year', featured: false, isActive: true,
    images: [img('jerkins/rainproof-jerkins/five-star-monsoon-guard-jerkin-primary.png')],
    tags: ['monsoon', 'high-visibility']
  },
  {
    name: 'RainTrail Lightweight Jerkin',
    description: 'An ultralight 210 g rainproof shell for hikers and commuters — breathable 2.5-layer fabric, pit zips, and an elastic-bound hood.',
    productType: 'jerkins', category: 'rainproof-jerkins', brand: '5Star Active', sku: 'FS-JK-RAINTRAIL',
    price: 2799, mrp: 3599, stock: 38, material: '2.5-layer nylon, 12K/10K', color: 'Forest',
    warranty: '2 years', featured: true, isActive: true,
    images: [img('jerkins/rainproof-jerkins/five-star-raintrail-lightweight-jerkin-primary.png')],
    tags: ['ultralight', 'breathable', 'hiking']
  },
  {
    name: 'StormShield Rainproof Jerkin',
    description: 'A rugged all-weather jerkin with welded seams, a wired hood brim, magnetic storm flap, and fleece-lined hand pockets for cold, wet mornings.',
    productType: 'jerkins', category: 'rainproof-jerkins', brand: '5Star Ride', sku: 'FS-JK-STORMSHIELD',
    stock: 0, price: 3299,
    variants: [
      { name: 'Size', value: 'M', sku: 'FS-JK-STORMSHIELD-M', price: 3299, stock: 16 },
      { name: 'Size', value: 'L', sku: 'FS-JK-STORMSHIELD-L', price: 3299, stock: 20 },
      { name: 'Size', value: 'XL', sku: 'FS-JK-STORMSHIELD-XL', price: 3499, stock: 11 }
    ],
    material: 'Welded 3-layer polyester, 20K waterproof', color: 'Charcoal', warranty: '3 years',
    featured: false, isActive: true,
    images: [img('jerkins/rainproof-jerkins/five-star-stormshield-rainproof-jerkin-primary.png')],
    tags: ['all-weather', 'welded-seams']
  },
  {
    name: 'WeatherPro Jerkin',
    description: 'A versatile 3-in-1 rainproof jerkin with a zip-out insulated inner that can be worn on its own. One jacket for every season.',
    productType: 'jerkins', category: 'rainproof-jerkins', brand: '5Star Voyage', sku: 'FS-JK-WEATHERPRO',
    price: 3999, mrp: 5199, stock: 24, material: 'Ripstop shell + puffer liner, 10K', color: 'Navy',
    warranty: '2 years', featured: true, isActive: true,
    images: [img('jerkins/rainproof-jerkins/five-star-weatherpro-jerkin-primary.png')],
    tags: ['3-in-1', 'all-season', 'best-seller']
  },

  // ===== JERKINS · Winter =====
  {
    name: 'Alpine Winter Jerkin',
    description: 'A mountain-grade insulated jerkin with 200 g synthetic fill, a fixed insulated hood, inner storm skirt, and glove-friendly zip pulls.',
    productType: 'jerkins', category: 'winter-jerkins', brand: '5Star Active', sku: 'FS-JK-ALPINE',
    price: 4299, mrp: 5599, stock: 26, material: 'Ripstop shell, 200g synthetic fill', color: 'Black',
    warranty: '3 years', featured: true, isActive: true,
    images: [img('jerkins/winter-jerkins/five-star-alpine-winter-jerkin-primary.png')],
    tags: ['insulated', 'mountain', 'best-seller']
  },
  {
    name: 'Arctic Comfort Jerkin',
    description: 'A plush sherpa-lined winter jerkin built for standing around in the cold — high fleece collar, deep hand-warmer pockets, and a wind-blocking membrane.',
    productType: 'jerkins', category: 'winter-jerkins', brand: '5Star Heritage', sku: 'FS-JK-ARCTIC',
    price: 3799, mrp: 4899, stock: 32, material: 'Canvas shell, sherpa lining', color: 'Tan',
    warranty: '2 years', featured: false, isActive: true,
    images: [img('jerkins/winter-jerkins/five-star-arctic-comfort-jerkin-primary.png')],
    tags: ['sherpa-lined', 'windproof']
  },
  {
    name: 'FrostGuard Winter Jerkin',
    description: 'A serious sub-zero jerkin rated to -20 °C with 300 g fill, a double-zip front, fur-trim hood option, and an internal media pocket with a headphone port.',
    productType: 'jerkins', category: 'winter-jerkins', brand: '5Star Active', sku: 'FS-JK-FROSTGUARD',
    stock: 0, price: 5499,
    variants: [
      { name: 'Size', value: 'M', sku: 'FS-JK-FROSTGUARD-M', price: 5499, stock: 12 },
      { name: 'Size', value: 'L', sku: 'FS-JK-FROSTGUARD-L', price: 5499, stock: 16 },
      { name: 'Size', value: 'XL', sku: 'FS-JK-FROSTGUARD-XL', price: 5799, stock: 7 },
      { name: 'Size', value: 'XXL', sku: 'FS-JK-FROSTGUARD-XXL', price: 5999, stock: 4 }
    ],
    material: 'Ripstop shell, 300g fill', color: 'Deep Navy', warranty: '3 years',
    featured: true, isActive: true,
    images: [img('jerkins/winter-jerkins/five-star-frostguard-winter-jerkin-primary.png')],
    tags: ['sub-zero', 'heavy-fill', 'best-seller']
  },
  {
    name: 'Summit Puffer Jerkin',
    description: 'A lightweight box-quilted puffer jerkin that packs into its chest pocket, with 90/10 down-alternative fill and a DWR finish to shed light snow.',
    productType: 'jerkins', category: 'winter-jerkins', brand: '5Star Voyage', sku: 'FS-JK-SUMMIT',
    price: 3299, mrp: 4299, stock: 40, material: 'Nylon shell, down-alternative fill', color: 'Olive',
    warranty: '2 years', featured: false, isActive: true,
    images: [img('jerkins/winter-jerkins/five-star-summit-puffer-jerkin-primary.png')],
    tags: ['packable', 'puffer']
  },
  {
    name: 'Urban Warmth Jerkin',
    description: 'A city winter jerkin that looks like a blazer and warms like a coat — brushed twill shell, quilted lining, and a clean two-button collar.',
    productType: 'jerkins', category: 'winter-jerkins', brand: '5Star Urban', sku: 'FS-JK-URBANWARMTH',
    price: 3599, mrp: 4699, stock: 28, material: 'Brushed twill, quilted lining', color: 'Charcoal',
    warranty: '2 years', featured: true, isActive: true,
    images: [img('jerkins/winter-jerkins/five-star-urban-warmth-jerkin-primary.png')],
    tags: ['smart', 'city-winter']
  },

  // ===== TROLLEYS · Cabin =====
  {
    name: 'Aero Cabin Trolley',
    description: 'A 55 cm hard-shell cabin trolley in lightweight polycarbonate with 8-wheel silent spinners, a TSA lock, and a fully lined split interior.',
    productType: 'trolleys', category: 'cabin-trolleys', brand: '5Star Voyage', sku: 'FS-TR-AERO',
    price: 5999, mrp: 7999, stock: 30, material: '100% polycarbonate', capacity: '55 cm / 38 L',
    color: 'Silver', dimensions: '55 × 38 × 22 cm', weight: '2.6 kg', warranty: '5 years',
    featured: true, isActive: true,
    images: [img('trolleys/cabin-trolleys/five-star-aero-cabin-trolley-primary.png')],
    tags: ['hard-shell', 'tsa-lock', 'best-seller']
  },
  {
    name: 'Business Class Cabin Trolley',
    description: 'A cabin trolley built for work trips — a front-opening laptop compartment, a USB pass-through port, a garment folder, and a whisper-quiet handle.',
    productType: 'trolleys', category: 'cabin-trolleys', brand: '5Star Pro', sku: 'FS-TR-BIZCLASS',
    price: 7499, mrp: 9499, stock: 20, material: 'Polycarbonate + ballistic front', capacity: '55 cm / 36 L',
    color: 'Matte Black', dimensions: '55 × 40 × 23 cm', weight: '3.1 kg', warranty: '5 years',
    featured: true, isActive: true,
    images: [img('trolleys/cabin-trolleys/five-star-business-class-cabin-trolley-primary.png')],
    tags: ['business', 'laptop-pocket', 'usb-port']
  },
  {
    name: 'CompactFly Cabin Trolley',
    description: 'An ultra-compact 50 cm trolley sized for strict low-cost carriers, with a wide-mouth opening, compression board, and recessed corner guards.',
    productType: 'trolleys', category: 'cabin-trolleys', brand: '5Star Voyage', sku: 'FS-TR-COMPACTFLY',
    price: 4499, mrp: 5999, stock: 42, material: 'ABS + polycarbonate blend', capacity: '50 cm / 31 L',
    color: 'Teal', dimensions: '50 × 35 × 20 cm', weight: '2.3 kg', warranty: '3 years',
    featured: false, isActive: true,
    images: [img('trolleys/cabin-trolleys/five-star-compactfly-cabin-trolley-primary.png')],
    tags: ['ultra-compact', 'budget-airline']
  },
  {
    name: 'Metro Cabin Spinner',
    description: 'A soft-side 55 cm cabin spinner with an expandable zip for +5 cm depth, front organiser pockets, and a stowable back strap for stair days.',
    productType: 'trolleys', category: 'cabin-trolleys', brand: '5Star Urban', sku: 'FS-TR-METRO',
    price: 4999, mrp: 6499, stock: 35, material: '900D water-resistant polyester', capacity: '55 cm / 40 L (expandable)',
    color: 'Graphite', dimensions: '55 × 36 × 24 cm', weight: '2.7 kg', warranty: '3 years',
    featured: false, isActive: true,
    images: [img('trolleys/cabin-trolleys/five-star-metro-cabin-spinner-primary.png')],
    tags: ['soft-side', 'expandable']
  },
  {
    name: 'SwiftWheel Cabin Trolley',
    description: 'A value hard-shell cabin trolley with dual spinner wheels, an aluminium multi-stop handle, and a cross-strap interior. Reliable, no-fuss travel.',
    productType: 'trolleys', category: 'cabin-trolleys', brand: '5Star Voyage', sku: 'FS-TR-SWIFTWHEEL',
    stock: 0, price: 3999,
    variants: [
      { name: 'Colour', value: 'Blue', sku: 'FS-TR-SWIFTWHEEL-BLU', price: 3999, stock: 26 },
      { name: 'Colour', value: 'Wine', sku: 'FS-TR-SWIFTWHEEL-WIN', price: 3999, stock: 18 },
      { name: 'Colour', value: 'Black', sku: 'FS-TR-SWIFTWHEEL-BLK', price: 4199, stock: 22 }
    ],
    material: 'ABS hard shell', capacity: '55 cm / 35 L', dimensions: '55 × 37 × 22 cm',
    weight: '2.5 kg', warranty: '3 years', featured: true, isActive: true,
    images: [img('trolleys/cabin-trolleys/five-star-swiftwheel-cabin-trolley-primary.png')],
    tags: ['value', 'hard-shell', 'best-seller']
  },

  // ===== TROLLEYS · Medium =====
  {
    name: 'Elite Journey Medium Trolley',
    description: 'A 65 cm check-in trolley in scratch-resistant brushed polycarbonate, with a 50/50 clamshell, tie-down straps, a zip divider, and a TSA combination lock.',
    productType: 'trolleys', category: 'medium-trolleys', brand: '5Star Pro', sku: 'FS-TR-ELITEJOURNEY',
    price: 7999, mrp: 10499, stock: 22, material: 'Brushed polycarbonate', capacity: '65 cm / 62 L',
    color: 'Champagne', dimensions: '65 × 45 × 27 cm', weight: '3.4 kg', warranty: '7 years',
    featured: true, isActive: true,
    images: [img('trolleys/medium-trolleys/five-star-elite-journey-medium-trolley-primary.png')],
    tags: ['check-in', 'premium', 'best-seller']
  },
  {
    name: 'Fusion Medium Luggage',
    description: 'A hybrid hard-front / soft-back 65 cm trolley — protective shell where it matters, plus two expandable front pockets for a laptop and last-minute extras.',
    productType: 'trolleys', category: 'medium-trolleys', brand: '5Star Voyage', sku: 'FS-TR-FUSION',
    price: 6499, mrp: 8499, stock: 26, material: 'Polycarbonate front + 1200D back', capacity: '65 cm / 68 L (expandable)',
    color: 'Slate Blue', dimensions: '65 × 44 × 29 cm', weight: '3.6 kg', warranty: '5 years',
    featured: false, isActive: true,
    images: [img('trolleys/medium-trolleys/five-star-fusion-medium-luggage-primary.png')],
    tags: ['hybrid', 'expandable', 'front-pocket']
  },
  {
    name: 'Horizon Medium Spinner',
    description: 'A lightweight 66 cm four-wheel spinner at just 3.1 kg, with a deep-textured shell that hides scuffs and a bright, fully lined interior with mesh pockets.',
    productType: 'trolleys', category: 'medium-trolleys', brand: '5Star Voyage', sku: 'FS-TR-HORIZON',
    price: 5999, mrp: 7799, stock: 34, material: '100% polypropylene', capacity: '66 cm / 64 L',
    color: 'Coral', dimensions: '66 × 44 × 28 cm', weight: '3.1 kg', warranty: '5 years',
    featured: true, isActive: true,
    images: [img('trolleys/medium-trolleys/five-star-horizon-medium-spinner-primary.png')],
    tags: ['lightweight', 'scuff-resistant']
  },
  {
    name: 'TravelGuard Medium Trolley',
    description: 'A tough 64 cm check-in trolley with reinforced corner bumpers, an anti-theft zipper track, double coil zips, and a built-in TSA lock. Made for baggage belts.',
    productType: 'trolleys', category: 'medium-trolleys', brand: '5Star Pro', sku: 'FS-TR-TRAVELGUARD',
    price: 6999, mrp: 8999, stock: 24, material: 'Reinforced polycarbonate', capacity: '64 cm / 60 L',
    color: 'Gunmetal', dimensions: '64 × 43 × 27 cm', weight: '3.5 kg', warranty: '7 years',
    featured: false, isActive: true,
    images: [img('trolleys/medium-trolleys/five-star-travelguard-medium-trolley-primary.png')],
    tags: ['rugged', 'anti-theft-zip']
  },
  {
    name: 'Voyager Medium Trolley',
    description: 'The all-rounder 65 cm trolley: silent dual spinners, an ergonomic square handle, compression straps, a laundry bag, and a 5-year cover.',
    productType: 'trolleys', category: 'medium-trolleys', brand: '5Star Voyage', sku: 'FS-TR-VOYAGERMED',
    stock: 0, price: 5499,
    variants: [
      { name: 'Colour', value: 'Navy', sku: 'FS-TR-VOYAGERMED-NVY', price: 5499, stock: 20 },
      { name: 'Colour', value: 'Burgundy', sku: 'FS-TR-VOYAGERMED-BRG', price: 5499, stock: 14 },
      { name: 'Colour', value: 'Silver', sku: 'FS-TR-VOYAGERMED-SLV', price: 5699, stock: 16 }
    ],
    material: 'Polycarbonate/ABS', capacity: '65 cm / 63 L', dimensions: '65 × 44 × 27 cm',
    weight: '3.3 kg', warranty: '5 years', featured: true, isActive: true,
    images: [img('trolleys/medium-trolleys/five-star-voyager-medium-trolley-primary.png')],
    tags: ['all-rounder', 'best-seller']
  },

  // ===== TROLLEYS · Large =====
  {
    name: 'Expedition Large Spinner',
    description: 'A 75 cm long-haul spinner with a huge 100 L capacity, dual-wheel spinners for stability under load, an over-height packing zone, and a 10-year warranty.',
    productType: 'trolleys', category: 'large-trolleys', brand: '5Star Pro', sku: 'FS-TR-EXPEDITION',
    price: 9999, mrp: 12999, stock: 18, material: 'German Makrolon polycarbonate', capacity: '75 cm / 100 L',
    color: 'Graphite', dimensions: '75 × 52 × 32 cm', weight: '4.6 kg', warranty: '10 years',
    featured: true, isActive: true,
    images: [img('trolleys/large-trolleys/five-star-expedition-large-spinner-primary.png')],
    tags: ['long-haul', 'high-capacity', 'best-seller']
  },
  {
    name: 'Grand Voyager Trolley',
    description: 'A 76 cm expandable check-in giant with a +6 cm expansion zip, cross straps plus a zip divider, a hanging toiletry pocket, and recessed TSA locks.',
    productType: 'trolleys', category: 'large-trolleys', brand: '5Star Voyage', sku: 'FS-TR-GRANDVOYAGER',
    price: 8499, mrp: 10999, stock: 20, material: 'Polycarbonate blend', capacity: '76 cm / 105 L (expandable)',
    color: 'Deep Red', dimensions: '76 × 50 × 33 cm', weight: '4.4 kg', warranty: '7 years',
    featured: false, isActive: true,
    images: [img('trolleys/large-trolleys/five-star-grand-voyager-trolley-primary.png')],
    tags: ['expandable', 'family-trip']
  },
  {
    name: 'Heritage Large Luggage',
    description: 'A premium 77 cm aluminium-look trolley with reinforced frame corners, twin TSA latches, a fully structured shell, and a lifetime-of-travel build.',
    productType: 'trolleys', category: 'large-trolleys', brand: '5Star Heritage', sku: 'FS-TR-HERITAGELG',
    price: 12999, mrp: 16999, stock: 10, material: 'Aluminium-finish polycarbonate', capacity: '77 cm / 98 L',
    color: 'Silver', dimensions: '77 × 51 × 31 cm', weight: '5.2 kg', warranty: '10 years',
    featured: true, isActive: true,
    images: [img('trolleys/large-trolleys/five-star-heritage-large-luggage-primary.png')],
    tags: ['premium', 'aluminium-look']
  },
  {
    name: 'MaxSpace Large Trolley',
    description: 'A value-focused 74 cm large trolley with the biggest usable interior in its class, four smooth spinners, and a lightweight polypropylene shell.',
    productType: 'trolleys', category: 'large-trolleys', brand: '5Star Voyage', sku: 'FS-TR-MAXSPACE',
    price: 6999, mrp: 8999, stock: 28, material: '100% polypropylene', capacity: '74 cm / 96 L',
    color: 'Emerald', dimensions: '74 × 49 × 31 cm', weight: '3.9 kg', warranty: '5 years',
    featured: false, isActive: true,
    images: [img('trolleys/large-trolleys/five-star-maxspace-large-trolley-primary.png')],
    tags: ['value', 'max-capacity']
  },
  {
    name: 'Ultimate Journey Trolley',
    description: 'The flagship 78 cm trolley: a curved anti-shock shell, hydraulic multi-stop handle, double-bearing silent spinners, a laptop-safe internal pocket, and a 10-year warranty.',
    productType: 'trolleys', category: 'large-trolleys', brand: '5Star Pro', sku: 'FS-TR-ULTIMATEJOURNEY',
    stock: 0, price: 11499,
    variants: [
      { name: 'Colour', value: 'Midnight', sku: 'FS-TR-ULTIMATEJOURNEY-MID', price: 11499, stock: 12 },
      { name: 'Colour', value: 'Champagne', sku: 'FS-TR-ULTIMATEJOURNEY-CHM', price: 11499, stock: 8 },
      { name: 'Colour', value: 'Space Grey', sku: 'FS-TR-ULTIMATEJOURNEY-SPG', price: 11999, stock: 6 }
    ],
    material: 'Anti-shock polycarbonate', capacity: '78 cm / 110 L', dimensions: '78 × 52 × 33 cm',
    weight: '4.8 kg', warranty: '10 years', featured: true, isActive: true,
    images: [img('trolleys/large-trolleys/five-star-ultimate-journey-trolley-primary.png')],
    tags: ['flagship', 'premium', 'best-seller']
  },

  // ===== Intentionally inactive (verifies hidden on storefront, visible in admin) =====
  {
    name: 'Discontinued Sample Jerkin (Inactive)',
    description: 'Kept inactive on purpose to verify that inactive products are hidden from the storefront but still visible in the admin panel.',
    productType: 'jerkins', category: 'leather-style-jerkins', brand: '5Star', sku: 'FS-TEST-INACTIVE-01',
    price: 100, mrp: 150, stock: 5, material: 'Test', color: 'Test',
    warranty: null, featured: false, isActive: false,
    images: [img('jerkins/leather-style-jerkins/five-star-classic-rider-jerkin-primary.png')],
    tags: ['test']
  }
];

// ── BRANCHES ────────────────────────────────────────────────────────────────
const BRANCHES = [
  {
    name: '5Star — Brigade Road',
    address: '17 Brigade Road, Bengaluru, Karnataka 560001',
    city: 'Bengaluru', state: 'Karnataka', phone: '+91 9876500001', email: 'brigaderoad@fivestar.example.com',
    timings: 'Mon–Sat: 10:00 AM – 9:00 PM, Sun: 11:00 AM – 7:00 PM',
    googleMapLink: 'https://maps.google.com/?q=Brigade+Road+Bengaluru',
    isActive: true, order: 1, isComingSoon: false
  },
  {
    name: '5Star — Linking Road',
    address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai', state: 'Maharashtra', phone: '+91 9876500002', email: 'linkingroad@fivestar.example.com',
    timings: 'Mon–Sun: 10:30 AM – 9:30 PM',
    googleMapLink: 'https://maps.google.com/?q=Linking+Road+Mumbai',
    isActive: true, order: 2, isComingSoon: false
  },
  {
    name: '5Star — Connaught Place',
    address: 'Block A, Connaught Place, New Delhi, Delhi 110001',
    city: 'New Delhi', state: 'Delhi', phone: '+91 9876500003', email: 'cp@fivestar.example.com',
    timings: 'Opening February 2027',
    isActive: true, order: 3, isComingSoon: true
  }
];

// ── COUPONS ─────────────────────────────────────────────────────────────────
const COUPONS = [
  {
    code: 'WELCOME10', description: '10% off your first order', discountType: 'percentage', discountValue: 10,
    minOrderAmount: 999, maxDiscount: 800, expiryDate: new Date(Date.now() + 60 * 86400000),
    isActive: true, showOnCheckout: true, usageLimit: 500, usedCount: 63
  },
  {
    code: 'FLAT500', description: 'Flat ₹500 off on orders above ₹4000', discountType: 'fixed', discountValue: 500,
    minOrderAmount: 4000, expiryDate: new Date(Date.now() + 21 * 86400000),
    isActive: true, showOnCheckout: true, usageLimit: 300, usedCount: 28
  },
  {
    code: 'TRAVEL25', description: 'Travel sale — 25% off trolleys & duffels', discountType: 'percentage', discountValue: 25,
    minOrderAmount: 2000, maxDiscount: 2500, expiryDate: new Date(Date.now() + 4 * 86400000),
    isActive: true, showOnCheckout: true, usageLimit: null, usedCount: 11
  },
  {
    code: 'EXPIRED50', description: 'Old expired promo (kept to test expiry handling)', discountType: 'percentage', discountValue: 50,
    minOrderAmount: 0, expiryDate: new Date(Date.now() - 10 * 86400000),
    isActive: true, showOnCheckout: false, usageLimit: 100, usedCount: 91
  },
  {
    code: 'VIP15', description: 'VIP customer discount — not shown at checkout', discountType: 'percentage', discountValue: 15,
    minOrderAmount: 2500, maxDiscount: 3000, expiryDate: new Date(Date.now() + 90 * 86400000),
    isActive: true, showOnCheckout: false, usageLimit: null, usedCount: 0
  }
];

// ── CUSTOMERS & ORDER PLAN ──────────────────────────────────────────────────
const CUSTOMERS = [
  { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', phone: '9812345601', address: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '9812345602', address: '45 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
  { name: 'Karthik Rajan', email: 'karthik.rajan@example.com', phone: '9812345603', address: '9 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', phone: '9812345604', address: '78 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
  { name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '9812345605', address: '23 Civil Lines', city: 'Jaipur', state: 'Rajasthan', pincode: '302006' }
];

const ORDER_STATUS_PLAN = [
  { orderStatus: 'placed', paymentStatus: 'pending', paymentMethod: 'cod' },
  { orderStatus: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay' },
  { orderStatus: 'processing', paymentStatus: 'paid', paymentMethod: 'razorpay' },
  { orderStatus: 'shipped', paymentStatus: 'paid', paymentMethod: 'cod' },
  { orderStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'razorpay' },
  { orderStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'cod' },
  { orderStatus: 'cancelled', paymentStatus: 'failed', paymentMethod: 'razorpay' }
];

// ── CAROUSEL (landing hero) ─────────────────────────────────────────────────
const CAROUSEL_IMAGES = [
  {
    url: img('bags/backpacks/five-star-trailblazer-travel-backpack-primary.png'),
    alt: 'Trailblazer travel backpack',
    caption: 'Pack Light. Travel Far.',
    subcaption: 'Backpacks, duffels and laptop bags engineered for the way you actually move.'
  },
  {
    url: img('trolleys/large-trolleys/five-star-expedition-large-spinner-primary.png'),
    alt: 'Expedition large spinner trolley',
    caption: 'Every Journey Deserves a 5Star Trolley.',
    subcaption: 'Silent spinners, TSA locks and warranties that outlast the trip.'
  },
  {
    url: img('jerkins/leather-style-jerkins/five-star-urban-edge-leather-style-jerkin-primary.png'),
    alt: 'Urban Edge leather-style jerkin',
    caption: 'Jerkins for the Road and the City.',
    subcaption: 'Leather-style, rainproof and winter jerkins — one for every forecast.'
  }
];

// ── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  const dummySkus = PRODUCTS.map((p) => p.sku);
  const dummyCoupons = COUPONS.map((c) => c.code);
  const dummyBranchNames = BRANCHES.map((b) => b.name);

  await Product.deleteMany({ sku: { $in: dummySkus } });
  await Coupon.deleteMany({ code: { $in: dummyCoupons } });
  await Branch.deleteMany({ name: { $in: dummyBranchNames } });
  await Order.deleteMany({ 'customerInfo.email': { $in: CUSTOMERS.map((c) => c.email) } });
  console.log('Cleared prior dummy data');

  let categoriesCreated = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create({ ...cat, isActive: true });
      categoriesCreated++;
    }
  }
  console.log(`Ensured categories exist (${categoriesCreated} created)`);

  const createdProducts = await Product.insertMany(PRODUCTS);
  console.log(`Created ${createdProducts.length} products`);

  await Coupon.insertMany(COUPONS);
  console.log(`Created ${COUPONS.length} coupons`);

  await Branch.insertMany(BRANCHES);
  console.log(`Created ${BRANCHES.length} branches`);

  let landing = await LandingContent.findOne();
  if (!landing) landing = new LandingContent();
  landing.heroTitle = landing.heroTitle || '5Star';
  landing.heroSubtitle = landing.heroSubtitle || 'Bags, Jerkins & Trolleys — Built to Travel.';
  landing.carouselImages = CAROUSEL_IMAGES;
  landing.historyTitle = landing.historyTitle || 'Crafted for the Journey';
  landing.historyText = landing.historyText ||
    'For years, 5Star has built bags, jerkins and trolleys for people who are always on the move — students, commuters, riders and frequent flyers. Every zip, wheel and seam is chosen to survive the trip and the years after it.';
  await landing.save();
  console.log('Updated landing content with carousel images');

  // Point the store logo at the bundled brand logo (served at /assets/logo/logo.svg)
  // so it shows in the navbar/footer without a manual upload. Other Settings fields
  // keep their schema defaults / any existing values.
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  settings.logo = '/assets/logo/logo.svg';
  await settings.save();
  console.log('Set store logo to /assets/logo/logo.svg');

  const activeProducts = createdProducts.filter((p) => p.isActive);
  let created = 0;
  for (let i = 0; i < ORDER_STATUS_PLAN.length; i++) {
    const plan = ORDER_STATUS_PLAN[i];
    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const itemCount = 1 + (i % 3);
    const items = [];
    let subtotal = 0;
    for (let j = 0; j < itemCount; j++) {
      const product = activeProducts[(i * 3 + j) % activeProducts.length];
      const useVariant = product.variants?.length > 0;
      const variant = useVariant ? product.variants[j % product.variants.length] : null;
      const price = variant ? variant.price : product.price;
      const quantity = 1 + (j % 2);
      items.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0],
        sku: variant?.sku || product.sku,
        brand: product.brand,
        variantId: variant?._id,
        variantLabel: variant ? `${variant.name}: ${variant.value}` : undefined,
        price,
        quantity
      });
      subtotal += price * quantity;
    }
    const shippingCharge = plan.paymentMethod === 'cod' ? 100 : 0;
    const discount = i === 1 ? Math.round(subtotal * 0.1) : 0;
    const total = Math.max(subtotal - discount, 0) + shippingCharge;

    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const seq = await Counter.next(`order-${yymm}`);
    const orderId = `${yymm}${String(seq).padStart(5, '0')}`;

    await Order.create({
      orderId,
      customerInfo: {
        name: customer.name, email: customer.email, phone: customer.phone,
        address: customer.address, city: customer.city, state: customer.state, pincode: customer.pincode,
        notes: i === 0 ? 'Please call before delivery' : undefined
      },
      items, subtotal, discount, shippingCharge,
      couponCode: discount > 0 ? 'WELCOME10' : undefined,
      total,
      paymentMethod: plan.paymentMethod,
      paymentStatus: plan.paymentStatus,
      orderStatus: plan.orderStatus,
      razorpayOrderId: plan.paymentMethod === 'razorpay' ? `order_dummy_${i}` : undefined,
      razorpayPaymentId: plan.paymentMethod === 'razorpay' && plan.paymentStatus === 'paid' ? `pay_dummy_${i}` : undefined
    });
    created++;
  }
  console.log(`Created ${created} orders across all statuses`);

  console.log('\nDummy data seed complete.');
  console.log(`Products: ${createdProducts.length} (${createdProducts.filter(p => p.variants?.length).length} with variants, ${createdProducts.filter(p => !p.isActive).length} inactive)`);
  console.log(`Coupons: ${COUPONS.length}, Branches: ${BRANCHES.length}, Orders: ${created}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
