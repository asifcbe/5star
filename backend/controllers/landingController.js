const LandingContent = require('../models/LandingContent');
const { uploadToStorage, deleteFromStorage } = require('../config/storage');

const getLanding = async (req, res) => {
  try {
    let landing = await LandingContent.findOne();
    if (!landing) landing = await LandingContent.create({});
    res.json(landing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateLanding = async (req, res) => {
  try {
    let landing = await LandingContent.findOne();
    if (!landing) landing = new LandingContent();

    const allowed = ['heroTitle', 'heroSubtitle', 'historyTitle', 'historyText', 'youtubeVideoId', 'youtubeTitle'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) landing[key] = req.body[key];
    });
    if (req.body.carouselImages) landing.carouselImages = JSON.parse(req.body.carouselImages);

    await landing.save();
    res.json(landing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    let landing = await LandingContent.findOne();
    if (!landing) landing = new LandingContent();

    const uploaded = await uploadToStorage(req.file);
    landing.carouselImages.push({
      url: uploaded.secure_url,
      alt: req.body.alt || '',
      caption: req.body.caption || '',
      subcaption: req.body.subcaption || ''
    });
    await landing.save();
    res.json(landing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCarouselImage = async (req, res) => {
  try {
    const landing = await LandingContent.findOne();
    if (!landing) return res.status(404).json({ message: 'Landing content not found' });
    const image = landing.carouselImages.id(req.params.imageId);
    if (!image) return res.status(404).json({ message: 'Slide not found' });

    if (req.body.alt !== undefined) image.alt = req.body.alt;
    if (req.body.caption !== undefined) image.caption = req.body.caption;
    if (req.body.subcaption !== undefined) image.subcaption = req.body.subcaption;

    if (req.file) {
      deleteFromStorage(image.url);
      const uploaded = await uploadToStorage(req.file);
      image.url = uploaded.secure_url;
    }

    await landing.save();
    res.json(landing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCarouselImage = async (req, res) => {
  try {
    const landing = await LandingContent.findOne();
    if (!landing) return res.status(404).json({ message: 'Landing content not found' });
    const image = landing.carouselImages.id(req.params.imageId);
    if (image) {
      deleteFromStorage(image.url);
      image.deleteOne();
      await landing.save();
    }
    res.json(landing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadHistoryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    let landing = await LandingContent.findOne();
    if (!landing) landing = new LandingContent();
    if (landing.historyImage) deleteFromStorage(landing.historyImage);
    const uploaded = await uploadToStorage(req.file);
    landing.historyImage = uploaded.secure_url;
    await landing.save();
    res.json(landing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getLanding,
  updateLanding,
  uploadCarouselImage,
  updateCarouselImage,
  deleteCarouselImage,
  uploadHistoryImage
};
