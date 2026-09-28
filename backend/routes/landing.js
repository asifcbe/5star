const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getLanding, updateLanding, uploadCarouselImage, updateCarouselImage, deleteCarouselImage, uploadHistoryImage
} = require('../controllers/landingController');

router.get('/', getLanding);
router.put('/', protect, adminOnly, updateLanding);
router.post('/carousel', protect, adminOnly, upload.single('image'), uploadCarouselImage);
router.put('/carousel/:imageId', protect, adminOnly, upload.single('image'), updateCarouselImage);
router.delete('/carousel/:imageId', protect, adminOnly, deleteCarouselImage);
router.post('/history-image', protect, adminOnly, upload.single('image'), uploadHistoryImage);

module.exports = router;
