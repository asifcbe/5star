const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { register, login, setupAdmin, getProfile, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/setup-admin', setupAdmin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
