// Script to check MongoDB collections in the BENTECH database
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ben_technova_ghana';

async function checkDB() {
  try {
    console.log('Connecting to:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//USER:PASS@'));
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!\n');

    const db = mongoose.connection.db;
    
    console.log('Databases on this cluster:');
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    dbs.databases.forEach(dbInfo => {
      console.log(`  - ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    console.log('\nCollections in current database (BENTECH):');
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('  (No collections found - database is empty)');
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
}

checkDB();