const Product = require('../models/Product');
const { uploadToStorage, deleteFromStorage } = require('../config/storage');

const getProducts = async (req, res) => {
  try {
    const { productType, category, featured, page = 1, limit = 12, search } = req.query;
    const filter = { isActive: true };
    if (productType) filter.productType = productType;
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    res.json({ products, total, pages: Math.ceil(total / limitNum), page: pageNum });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCategoryCounts = async (req, res) => {
  try {
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const map = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.tags) body.tags = JSON.parse(body.tags);
    if (body.variants) body.variants = JSON.parse(body.variants);
    body.featured = body.featured === 'true' || body.featured === true;

    let images = [];
    if (req.files && req.files.length) {
      const uploaded = await Promise.all(req.files.map((f) => uploadToStorage(f)));
      images = uploaded.map((u) => u.secure_url);
    }
    if (body.imageUrls) {
      const extra = JSON.parse(body.imageUrls);
      images = [...images, ...extra];
    }
    delete body.imageUrls;

    const product = await Product.create({ ...body, images });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const body = { ...req.body };
    if (body.tags) body.tags = JSON.parse(body.tags);
    if (body.variants) body.variants = JSON.parse(body.variants);
    if (body.featured !== undefined) body.featured = body.featured === 'true' || body.featured === true;
    if (body.isActive !== undefined) body.isActive = body.isActive === 'true' || body.isActive === true;

    let existingImages = product.images;
    if (body.existingImages) {
      existingImages = JSON.parse(body.existingImages);
      const removed = product.images.filter((img) => !existingImages.includes(img));
      removed.forEach((img) => deleteFromStorage(img));
    }
    delete body.existingImages;
    delete body.imageUrls;

    let newImages = [];
    if (req.files && req.files.length) {
      const uploaded = await Promise.all(req.files.map((f) => uploadToStorage(f)));
      newImages = uploaded.map((u) => u.secure_url);
    }

    Object.assign(product, body, { images: [...existingImages, ...newImages] });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.images.forEach((img) => deleteFromStorage(img));
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  getCategoryCounts,
  getAllProductsAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
