const router = require('express').Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  createOrder, getOrders, getOrderStats, getMyOrders, getOrderByOrderId,
  getOrdersByPhone, getOrder, updateOrderStatus, resetAllOrders, deleteOrder
} = require('../controllers/orderController');

router.post('/', optionalAuth, createOrder);
router.get('/', protect, adminOnly, getOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/my', protect, getMyOrders);
router.get('/track/:orderId', getOrderByOrderId);
router.get('/track-phone/:phone', getOrdersByPhone);
router.get('/:id', protect, adminOnly, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/reset-all', protect, adminOnly, resetAllOrders);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
