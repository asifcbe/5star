const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const shapeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  isAdmin: user.isAdmin,
  token: generateToken(user._id)
});

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json(shapeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json(shapeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setupAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, isAdmin: true });
    res.status(201).json(shapeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json(shapeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, setupAdmin, getProfile, updateProfile };
