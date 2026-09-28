const fs = require('fs');
const path = require('path');
const Settings = require('../models/Settings');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Branch = require('../models/Branch');
const Category = require('../models/Category');
const LandingContent = require('../models/LandingContent');
const Counter = require('../models/Counter');
const { uploadToStorage, deleteFromStorage } = require('../config/storage');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const allowed = [
      'storeName', 'storeTagline', 'storeEmail', 'storePhone', 'storeAddress',
      'codEnabled', 'razorpayKeyId', 'metaDescription', 'shippingCharge', 'codCharge', 'theme'
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });

    if (req.body.socialLinks) {
      settings.socialLinks = JSON.parse(req.body.socialLinks);
    }

    if (req.file) {
      if (settings.logo) deleteFromStorage(settings.logo);
      const uploaded = await uploadToStorage(req.file);
      settings.logo = uploaded.secure_url;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetAllData = async (req, res) => {
  try {
    if (req.body.confirm !== 'DELETE ALL DATA') {
      return res.status(400).json({ message: 'Confirmation phrase does not match. Nothing was deleted.' });
    }

    const [products] = await Promise.all([Product.find().select('images')]);
    const settings = await Settings.findOne();

    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Coupon.deleteMany({}),
      Branch.deleteMany({}),
      Category.deleteMany({}),
      LandingContent.deleteMany({}),
      Counter.deleteMany({})
    ]);

    products.forEach((p) => (p.images || []).forEach((img) => deleteFromStorage(img)));
    if (settings) {
      if (settings.logo) deleteFromStorage(settings.logo);
      await Settings.deleteMany({});
    }
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
      if (err) return;
      files.forEach((file) => {
        if (file === '.gitkeep') return;
        fs.unlink(path.join(uploadsDir, file), () => {});
      });
    });

    res.json({ message: 'All store data has been deleted. Admin accounts were preserved.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings, resetAllData };
