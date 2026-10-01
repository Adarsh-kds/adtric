const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const login = async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: {
          ...(!email && { email: "Email is required" }),
          ...(!password && { password: "Password is required" }),
        },
      });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.password)
      : false;

    if (!passwordMatches) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      data: { token, email: admin.email },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
