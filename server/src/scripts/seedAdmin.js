/**
 * scripts/seedAdmin.js
 *
 * One-time script to create THE admin account for JanSewa.
 *
 * Admin accounts can no longer be created through the public /register
 * form with just any email — the User model and the /auth/register route
 * both reject role "admin" unless the email matches the reserved pattern
 * admin.<name>@jansewa.gov.np (see src/constants/index.js).
 *
 * This script is the intended way to actually create that account. Run it
 * once against your database:
 *
 *   node src/scripts/seedAdmin.js
 *
 * By default it creates:
 *   email:    admin.jansewa@jansewa.gov.np
 *   password: a freshly generated random password, printed ONCE below
 *
 * To choose your own values instead, set env vars before running:
 *   ADMIN_EMAIL=admin.anamika@jansewa.gov.np ADMIN_PASSWORD=yourOwnPass123 node src/scripts/seedAdmin.js
 *
 * Re-running this script is safe — if an account with that email already
 * exists it does nothing and tells you so, it will never overwrite an
 * existing admin's password. Use the forgot-password flow (once you build
 * it) to change the password later.
 */
require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ROLES, ADMIN_EMAIL_REGEX } = require("../constants");

const generatePassword = () => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%";
  let out = "";
  for (let i = 0; i < 14; i++) out += chars[crypto.randomInt(chars.length)];
  return out;
};

const run = async () => {
  const email = (process.env.ADMIN_EMAIL || "admin.jansewa@jansewa.gov.np").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || generatePassword();
  const name = process.env.ADMIN_NAME || "JanSewa Admin";

  if (!ADMIN_EMAIL_REGEX.test(email)) {
    console.error(
      `✖ "${email}" doesn't match the reserved admin pattern admin.<name>@jansewa.gov.np`
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account already exists for ${email} — nothing to do.`);
    console.log("Use the forgot-password flow to reset its password.");
    await mongoose.connection.close();
    return;
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: ROLES.ADMIN,
    isActive: true,
  });

  console.log("\n✔ Admin account created successfully.\n");
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${password}`);
  console.log("\nSave this password now — it is only shown here, this once.");
  console.log("Log in at /login with these credentials.\n");

  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
