const crypto = require("crypto");
const { uploadFile } = require("./r2");

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const saveImage = async (file) => {
  const randomPart = crypto.randomBytes(6).toString("hex");
  const fileName = `${Date.now()}-${randomPart}.${EXTENSIONS[file.mimetype]}`;
  return uploadFile(file.buffer, fileName, file.mimetype, "projects");
};

module.exports = saveImage;
