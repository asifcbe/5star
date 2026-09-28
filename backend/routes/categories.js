const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getCategories, getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/admin/all', protect, adminOnly, getAllCategoriesAdmin);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
