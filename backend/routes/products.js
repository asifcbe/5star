const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts, getCategoryCounts, getAllProductsAdmin, getProduct, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/category-counts', getCategoryCounts);
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, upload.array('images', 10), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
