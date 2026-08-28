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
        
        // Let's drop referenceId index if it exists
        const hasReferenceIdIndex = indexes.some(idx => idx.name === 'referenceId_1' || (idx.key && idx.key.referenceId));
        if (hasReferenceIdIndex) {
          console.log("Found unique index on referenceId. Dropping it...");
          await c.dropIndex('referenceId_1').catch(e => console.log(e.message));
          console.log("Dropped referenceId!");
        }

        // Drop userId index if it exists as a unique index (which prevents multiple complaints)
        const hasUserIdIndex = indexes.some(idx => idx.name === 'userId_1' || idx.name === 'createdBy_1');
        if (hasUserIdIndex) {
          console.log("Found index on userId. Dropping it...");
          await c.dropIndex('userId_1').catch(e => console.log(e.message));
          await c.dropIndex('createdBy_1').catch(e => console.log(e.message));
          console.log("Dropped userId index!");
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
