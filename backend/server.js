const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { getMongoUri } = require('./config/db');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// User-uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Bundled sample product images (5Star/assets/...) — seeded products reference these
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/landing', require('./routes/landing'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/payment', require('./routes/payment'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: '5Star API is running' }));

const seedAdmin = async () => {
  const User = require('./models/User');
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@fivestar.example.com';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      name: process.env.ADMIN_SEED_NAME || 'fivestaradmin',
      email,
      password: process.env.ADMIN_SEED_PASSWORD || 'changeme123',
      isAdmin: true
    });
    console.log('✅ Admin account created:', email);
  }
};

mongoose.connect(getMongoUri())
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await seedAdmin();
  })
  .catch(err => console.error('❌ MongoDB Error:', err.message));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 5Star server running on port ${PORT}`));
