/**
 * seeder.js — populates a fresh database with everything needed to
 * actually exercise the app: one admin, one department-staff account
 * per department, and a handful of sample departments.
 *
 * Run with:   node seeder.js         (import)
 *             node seeder.js -d      (destroy: wipes departments + all
 *                                     non-admin users)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Department = require("./src/models/Department");
const Announcement = require("./src/models/Announcement");
const { ROLES, ANNOUNCEMENT_CATEGORIES } = require("./src/constants");

const departments = [
  { departmentName: "Water Supply Department", description: "Handles water leakage, supply, and quality issues.", contactEmail: "water@jansewa.gov.np" },
  { departmentName: "Roads & Infrastructure", description: "Potholes, road damage, and blockages.", contactEmail: "roads@jansewa.gov.np" },
  { departmentName: "Sanitation Department", description: "Garbage collection and public litter.", contactEmail: "sanitation@jansewa.gov.np" },
  { departmentName: "Electricity Department", description: "Power outages and wiring issues.", contactEmail: "electricity@jansewa.gov.np" },
  { departmentName: "Drainage Department", description: "Blocked and overflowing drains.", contactEmail: "drainage@jansewa.gov.np" },
  { departmentName: "Street Lighting Department", description: "Non-functional street lights and damaged poles.", contactEmail: "streetlight@jansewa.gov.np" },
];

const connect = () => mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
  try {
    await connect();
    console.log("Connected to MongoDB.");

    // --- Admin ---
    let admin = await User.findOne({ role: ROLES.ADMIN });
    if (!admin) {
      admin = await User.create({
        name: "System Administrator",
        email: "admin@jansewa.gov.np",
        password: "Admin@12345",
        phone: "9800000000",
        role: ROLES.ADMIN,
      });
      console.log("✅ Admin created: admin@jansewa.gov.np / Admin@12345");
    } else {
      console.log("ℹ️  Admin already exists, skipping.");
    }

    // --- Departments + one staff account each ---
    for (const dept of departments) {
      let department = await Department.findOne({ departmentName: dept.departmentName });
      if (!department) {
        department = await Department.create(dept);
        console.log(`✅ Department created: ${dept.departmentName}`);
      }

      const staffEmail = dept.contactEmail;
      const existingStaff = await User.findOne({ email: staffEmail });
      if (!existingStaff) {
        await User.create({
          name: `${dept.departmentName} Staff`,
          email: staffEmail,
          password: "Staff@12345",
          phone: "9800000001",
          role: ROLES.DEPARTMENT,
          department: department._id,
          designation: "Field Officer",
        });
        console.log(`✅ Staff account created: ${staffEmail} / Staff@12345`);
      }
    }

    // --- Sample citizen (handy for quick manual testing) ---
    const sampleEmail = "citizen@jansewa.gov.np";
    const existingCitizen = await User.findOne({ email: sampleEmail });
    if (!existingCitizen) {
      await User.create({
        name: "Divya Sharma",
        email: sampleEmail,
        password: "Citizen@12345",
        phone: "9811111111",
        role: ROLES.CITIZEN,
      });
      console.log(`✅ Sample citizen created: ${sampleEmail} / Citizen@12345`);
    }

    // --- Sample announcements (handy so the public Announcements page
    //     isn't empty on a fresh install) ---
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.insertMany([
        {
          title: "Welcome to the new JanSewa portal",
          message:
            "We've launched a redesigned complaint management system so you can report and track public service issues faster than ever. Explore the categories, submit your first complaint, and let us know what you think.",
          category: ANNOUNCEMENT_CATEGORIES.GENERAL,
          isPinned: true,
          createdBy: admin._id,
        },
        {
          title: "Scheduled maintenance — this weekend",
          message:
            "JanSewa will undergo scheduled maintenance from 2–4 AM. The site may be briefly unavailable during this window. We apologize for any inconvenience.",
          category: ANNOUNCEMENT_CATEGORIES.MAINTENANCE,
          isPinned: false,
          createdBy: admin._id,
        },
        {
          title: "New complaint priority levels",
          message:
            "You can now mark complaints as Low, Medium, High, or Critical priority when submitting them, helping departments triage urgent issues faster.",
          category: ANNOUNCEMENT_CATEGORIES.POLICY,
          isPinned: false,
          createdBy: admin._id,
        },
      ]);
      console.log("✅ Sample announcements created.");
    }

    console.log("\n🎉 Seed complete! Login with any of the accounts above.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connect();
    await User.deleteMany({ role: { $ne: ROLES.ADMIN } });
    await Department.deleteMany();
    await Announcement.deleteMany();
    console.log("🗑️  Departments, announcements cleared; non-admin users removed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Destroy failed:", error.message);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
