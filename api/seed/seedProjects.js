require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Project = require("../models/Project");
const makeSlug = require("../utils/makeSlug");
const { uploadFile } = require("../utils/r2");
const projects = require("./projectsData");

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Reads seed/images/<folder>/ : cover.* is the cover, gallery-N.* are the gallery.
const readImages = (folder) => {
  const directory = path.join(__dirname, "images", folder);
  if (!fs.existsSync(directory)) {
    throw new Error(
      `Missing images folder seed/images/${folder}. Run "npm run seed:images" once to download them.`
    );
  }

  const files = fs
    .readdirSync(directory)
    .filter((file) => CONTENT_TYPES[path.extname(file).toLowerCase()])
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const cover = files.find((file) => file.startsWith("cover."));
  if (!cover) throw new Error(`seed/images/${folder} has no cover image (cover.jpg, cover.png or cover.webp)`);

  return {
    cover,
    gallery: files.filter((file) => file.startsWith("gallery-")),
    directory,
  };
};

const upload = async (directory, folder, file) => {
  const buffer = fs.readFileSync(path.join(directory, file));
  const contentType = CONTENT_TYPES[path.extname(file).toLowerCase()];
  return uploadFile(buffer, `${folder}-${file}`, contentType, "seed");
};

const run = async () => {
  // Check every folder first so nothing is deleted if an image is missing.
  const prepared = projects.map((item) => ({ item, images: readImages(item.folder) }));

  await connectDB();
  await Project.deleteMany({});

  for (const { item, images } of prepared) {
    const coverImage = await upload(images.directory, item.folder, images.cover);
    const gallery = [];
    for (const file of images.gallery) {
      gallery.push(await upload(images.directory, item.folder, file));
    }

    await Project.create({
      name: item.name,
      slug: await makeSlug(item.name),
      location: item.location,
      propertyType: item.propertyType,
      status: item.status,
      startingPrice: item.startingPrice,
      configuration: item.configuration,
      shortDescription: item.shortDescription,
      coverImage,
      gallery,
      featured: item.featured,
      published: true,
    });
    console.log(`Created: ${item.name}`);
  }

  console.log(`Done. ${projects.length} projects seeded.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
