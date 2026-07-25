/**
 * Database seeder - creates an initial admin user and default departments.
 * Run with: node seeder.js         (import data)
 *           node seeder.js -d      (destroy/clear data)
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Department from "./models/Department.js";

const departments = [
  { name: "Water Supply Department", code: "WATER", categories: ["Water Leakage", "No Water Supply", "Contaminated Water"] },
  { name: "Electricity Department", code: "ELEC", categories: ["Power Outage", "Streetlight Not Working", "Voltage Fluctuation"] },
  { name: "Roads & Infrastructure", code: "ROADS", categories: ["Potholes", "Broken Footpath", "Illegal Construction"] },
  { name: "Sanitation Department", code: "SANIT", categories: ["Garbage Collection", "Public Toilet Issue", "Drainage Blockage"] },
  { name: "Public Health Department", code: "HEALTH", categories: ["Stray Animals", "Mosquito Breeding", "Food Safety"] },
];

const importData = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      await User.create({
        name: "System Administrator",
        email: "admin@jansewa.gov.in",
        phone: "9999999999",
        password: "Admin@12345",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Default admin created: admin@jansewa.gov.in / Admin@12345");
    } else {
      console.log("ℹ️  Admin already exists, skipping.");
    }

    for (const dept of departments) {
      const exists = await Department.findOne({ code: dept.code });
      if (!exists) {
        await Department.create(dept);
        console.log(`✅ Department created: ${dept.name}`);
      }
    }

    console.log("🎉 Data import complete!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany({ role: { $ne: "admin" } });
    await Department.deleteMany();
    console.log("🗑️  Data destroyed (departments cleared, non-admin users removed)!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
