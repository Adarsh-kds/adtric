const Project = require("../models/Project");

const toSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const makeSlug = async (name, ignoreId) => {
  const baseSlug = toSlug(name) || "project";
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const filter = { slug };
    if (ignoreId) {
      filter._id = { $ne: ignoreId };
    }
    const exists = await Project.exists(filter);
    if (!exists) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = makeSlug;
