const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const errors = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = err.errors[field].message;
    });
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  res.status(500).json({ success: false, message: "Something went wrong" });
};

module.exports = { notFound, errorHandler };
