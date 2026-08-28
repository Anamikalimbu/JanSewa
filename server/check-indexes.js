require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    const collections = await mongoose.connection.db.collections();
    for (let c of collections) {
      if (c.collectionName === "complaints") {
        const indexes = await c.indexes();
        console.log("Complaints indexes:", indexes);
        
        // Let's drop it if it exists
        const hasReferenceIdIndex = indexes.some(idx => idx.name === 'referenceId_1' || (idx.key && idx.key.referenceId));
        if (hasReferenceIdIndex) {
          console.log("Found unique index on referenceId. Dropping it...");
          await c.dropIndex('referenceId_1').catch(e => console.log(e.message));
          console.log("Dropped!");
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
