require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await Admin.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.password = hashedPassword;
    await existing.save();
    console.log(`Admin password updated for ${existing.email}`);
  } else {
    const admin = await Admin.create({ email, password: hashedPassword });
    console.log(`Admin created: ${admin.email}`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Admin seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
