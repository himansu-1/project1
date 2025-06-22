// utils/uploadImage.js
const cloudinary = require('cloudinary').v2;

// Cloudinary config (consider putting this in a config file)
cloudinary.config({
  cloud_name: "dgg2kgrkj", //cloud name
  api_key: "357111662639466", //api key
  api_secret: "0xtszLljU9_RQ6mEEAygTgv8NMk", //api secret
});

/**
 * Upload image to cloudinary
 * @param {string} file - base64 string or local path
 * @param {string} folder - target folder in Cloudinary
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadImage = async (file, folder = 'profile-images') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error('Image upload failed: ' + error.message);
  }
};

module.exports = uploadImage;
