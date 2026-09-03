const User = require("../models/User");
const Department = require("../models/Department");
const { ROLES } = require("../constants");

const seedDefaults = async () => {
  try {
    // Remove the obsolete unique index left by the former `name` field.
    const departmentIndexes = await Department.collection.indexes();
    for (const obsoleteIndex of ["name_1", "code_1"]) {
      if (departmentIndexes.some((index) => index.name === obsoleteIndex)) {
        await Department.collection.dropIndex(obsoleteIndex);
        console.log(`✔ Removed obsolete departments.${obsoleteIndex.replace("_1", "")} index`);
      }
    }

    const userIndexes = await User.collection.indexes();
    if (userIndexes.some((index) => index.name === "phone_1")) {
      await User.collection.dropIndex("phone_1");
      console.log("✔ Removed obsolete users.phone index");
    }

    // 1. Seed Departments if none exist
    let waterDept = await Department.findOne({ departmentName: "Water Supply Department" });
    if (!waterDept) {
      waterDept = await Department.create({
        departmentName: "Water Supply Department",
        description: "Handles clean water distribution, pipe leaks, and drainage issues.",
        contactEmail: "water@jansewa.gov.np",
        categories: ["Water", "Drainage"],
      });
      console.log("✔ Department created: Water Supply Department");
    }

    let roadDept = await Department.findOne({ departmentName: "Roads & Infrastructure Department" });
    if (!roadDept) {
      roadDept = await Department.create({
        departmentName: "Roads & Infrastructure Department",
        description: "Handles potholes, road maintenance, and streetlights.",
        contactEmail: "roads@jansewa.gov.np",
        categories: ["Road", "StreetLight"],
      });
      console.log("✔ Department created: Roads & Infrastructure Department");
    }

    // 2. Seed Default Admin Account if missing
    const adminEmail = "admin.jansewa@jansewa.gov.np";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "JanSewa Admin",
        email: adminEmail,
        password: "Admin@1234",
        role: ROLES.ADMIN,
        isActive: true,
        accountStatus: "approved",
      });
      console.log(`✔ Admin user created: ${adminEmail} (Pass: Admin@12345)`);
    }

    // 3. Seed Default Citizen Account if missing
    const citizenEmail = "citizen@jansewa.gov.np";
    const existingCitizen = await User.findOne({ email: citizenEmail });
    if (!existingCitizen) {
      await User.create({
        name: "Test Citizen",
        email: citizenEmail,
        password: "Citizen@12345",
        role: ROLES.CITIZEN,
        isActive: true,
        accountStatus: "approved",
      });
      console.log(`✔ Citizen user created: ${citizenEmail} (Pass: Citizen@12345)`);
    }

    // 4. Seed Default Department Officer if missing
    const officerEmail = "officer.water@jansewa.gov.np";
    const existingOfficer = await User.findOne({ email: officerEmail });
    if (!existingOfficer) {
      await User.create({
        name: "Water Officer Ram",
        email: officerEmail,
        password: "Officer@12345",
        role: ROLES.DEPARTMENT,
        departmentId: waterDept._id,
        isActive: true,
        accountStatus: "approved",
      });
      console.log(`✔ Officer user created: ${officerEmail} (Pass: Officer@12345)`);
    }

  } catch (err) {
    console.error("Error during auto-seeding:", err.message);
    throw err;
  }
};

module.exports = seedDefaults;
