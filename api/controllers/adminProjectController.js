const mongoose = require("mongoose");
const Project = require("../models/Project");
const makeSlug = require("../utils/makeSlug");
const saveImage = require("../utils/saveImage");
const { deleteFile } = require("../utils/r2");
const getValidationErrors = require("../utils/getValidationErrors");

const toText = (value) => (typeof value === "string" ? value : undefined);

const toBoolean = (value) => {
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "off" || value === "0") return false;
  return undefined;
};

const pickFields = (body) => {
  const fields = {
    name: toText(body.name),
    location: toText(body.location),
    propertyType: toText(body.propertyType),
    status: toText(body.status),
    startingPrice: toText(body.startingPrice),
    configuration: toText(body.configuration),
    shortDescription: toText(body.shortDescription),
    featured: toBoolean(body.featured),
    published: toBoolean(body.published),
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined) {
      delete fields[key];
    }
  });

  return fields;
};

const removeFiles = async (urls) => {
  for (const url of urls) {
    try {
      await deleteFile(url);
    } catch (error) {
      console.error("Could not delete image:", error.message);
    }
  }
};

const findProject = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return Project.findById(id);
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Project not found" });

const listProjects = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;

    const total = await Project.countDocuments();
    const projects = await Project.find()
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return notFound(res);
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const fields = pickFields(req.body);
    const coverFile = req.files && req.files.coverImage && req.files.coverImage[0];
    const galleryFiles = (req.files && req.files.gallery) || [];

    const project = new Project({
      ...fields,
      slug: await makeSlug(fields.name || ""),
      coverImage: coverFile ? "pending" : undefined,
    });

    const errors = await getValidationErrors(project);
    if (!coverFile) {
      errors.coverImage = "Cover image is required";
    }
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", errors });
    }

    const uploaded = [];
    try {
      project.coverImage = await saveImage(coverFile);
      uploaded.push(project.coverImage);

      project.gallery = [];
      for (const file of galleryFiles) {
        const url = await saveImage(file);
        uploaded.push(url);
        project.gallery.push(url);
      }

      await project.save();
    } catch (error) {
      await removeFiles(uploaded);
      throw error;
    }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return notFound(res);
    }

    const fields = pickFields(req.body);
    const coverFile = req.files && req.files.coverImage && req.files.coverImage[0];
    const galleryFiles = (req.files && req.files.gallery) || [];

    if (fields.name && fields.name.trim() !== project.name) {
      project.slug = await makeSlug(fields.name, project._id);
    }
    project.set(fields);

    const errors = await getValidationErrors(project);
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", errors });
    }

    const oldCover = project.coverImage;
    const uploaded = [];
    try {
      if (coverFile) {
        project.coverImage = await saveImage(coverFile);
        uploaded.push(project.coverImage);
      }
      for (const file of galleryFiles) {
        const url = await saveImage(file);
        uploaded.push(url);
        project.gallery.push(url);
      }

      await project.save();
    } catch (error) {
      await removeFiles(uploaded);
      throw error;
    }

    if (coverFile) {
      await removeFiles([oldCover]);
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return notFound(res);
    }

    const images = [project.coverImage, ...project.gallery];
    await project.deleteOne();
    await removeFiles(images);

    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

const removeGalleryImage = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return notFound(res);
    }

    const image = toText(req.body.image);
    if (!image || !project.gallery.includes(image)) {
      return res.status(404).json({
        success: false,
        message: "Image not found in this project's gallery",
      });
    }

    project.gallery = project.gallery.filter((item) => item !== image);
    await project.save();
    await removeFiles([image]);

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  removeGalleryImage,
};
