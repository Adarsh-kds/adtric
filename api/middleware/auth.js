const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please log in to continue" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Session expired. Please log in again" });
  }
};

module.exports = auth;
