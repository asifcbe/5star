const Branch = require('../models/Branch');

const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllBranchesAdmin = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ order: 1, createdAt: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBranches, getAllBranchesAdmin, createBranch, updateBranch, deleteBranch };
