const fs = require('fs');
const path = require('path');

const uploadToStorage = (file) =>
  Promise.resolve({ secure_url: `/uploads/${file.filename}` });

const deleteFromStorage = (url) => {
  if (!url || (url.includes('http') && !url.startsWith('/uploads'))) return;
  if (!url.startsWith('/uploads')) return; // never touch bundled /assets images
  const filename = url.split('/uploads/')[1];
  if (!filename) return;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('File delete error:', err.message);
  });
};

module.exports = { uploadToStorage, deleteFromStorage };
