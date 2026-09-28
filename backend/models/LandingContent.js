const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  caption: { type: String },
  subcaption: { type: String }
});

const landingSchema = new mongoose.Schema({
  heroTitle: { type: String, default: '5Star' },
  heroSubtitle: { type: String, default: 'Bags, Jerkins & Trolleys — Built to Travel.' },
  carouselImages: [carouselImageSchema],
  historyTitle: { type: String, default: 'Crafted for the Journey' },
  historyText: { type: String },
  historyImage: { type: String },
  youtubeVideoId: { type: String },
  youtubeTitle: { type: String, default: 'Our Story' }
}, { timestamps: true });

module.exports = mongoose.model('LandingContent', landingSchema);
