const Category = require('../models/Category');
const Product = require('../models/Product');

const slugify = (str) =>
  str.toString().trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getCategories = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.productType) filter.productType = req.query.productType;
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, productType, icon, order, isActive } = req.body;
    const slug = slugify(name);
    const category = await Category.create({ name, slug, productType, icon, order, isActive });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A category with this name already exists' });
    res.status(500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.name) body.slug = slugify(body.name);
    const category = await Category.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A category with this name already exists' });
    res.status(500).json({ message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const inUse = await Product.countDocuments({ category: category.slug });
    if (inUse > 0) {
      return res.status(400).json({ message: `Cannot delete — ${inUse} product(s) still use this category. Reassign or delete them first.` });
    }
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCategories, getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory };
