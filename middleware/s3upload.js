const multer = require("multer");
const path = require("path");

const s3storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, "public/image");
  },
});

const s3upload = multer({
  s3storage,
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(
        new Error("Only image formats are allowed! (.PNG, .JPG AND .JPEG).")
      );
    }
    callback(null, true);
  },
}).fields([
  { name: "identity_pic", maxCount: 1 },
  { name: "selfie_identity_pic", maxCount: 1 },
  { name: "book_account_pic", maxCount: 1 },
]);

const s3uploadGallery = multer({
  s3storage,
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(
        new Error("Only image formats are allowed! (.PNG, .JPG AND .JPEG).")
      );
    }
    callback(null, true);
  },
}).fields([
  { name: "thumbnail_pict", maxCount: 1 },
  { name: "pict_1", maxCount: 1 },
  { name: "pict_2", maxCount: 1 },
  { name: "pict_3", maxCount: 1 },
  { name: "pict_4", maxCount: 1 },
  // { name: "pict_5", maxCount: 1 },
  // { name: "pict_6", maxCount: 1 },
]);

module.exports = { s3upload, s3uploadGallery };
