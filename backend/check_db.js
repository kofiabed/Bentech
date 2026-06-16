// Script to check MongoDB collections with DNS patch
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google Public DNS

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ben_technova_ghana';

async function checkDB() {
  try {
    console.log('Using MONGO_URI:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//USER:PASS@'));
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    
    console.log('✅ Connected successfully!\n');

    const db = mongoose.connection.db;
    
    console.log('📊 All databases on this Atlas cluster:');
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    dbs.databases.forEach(dbInfo => {
      console.log(`   ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    const currentDbName = mongoose.connection.db.databaseName;
    console.log(`\n📁 Currently connected to database: ${currentDbName}`);
    console.log('\n📁 Collections in this database:');
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('   (Empty - no collections found)');
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`   📄 ${col.name}: ${count} document(s)`);
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