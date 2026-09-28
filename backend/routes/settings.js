const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getSettings, updateSettings, resetAllData } = require('../controllers/settingsController');

router.get('/', getSettings);
router.put('/', protect, adminOnly, upload.single('logo'), updateSettings);
router.delete('/reset-all-data', protect, adminOnly, resetAllData);

module.exports = router;
