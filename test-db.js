// Force Node.js to bypass local network DNS blocks and use public lookups
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google's Public DNS

const mongoose = require('mongoose');

// Your exact clean Atlas connection string
const testURI = "mongodb+srv://BENTECH:BENTECH12@bentech.uns33ib.mongodb.net/BENTECH?retryWrites=true&w=majority&appName=BENTECH";

async function checkConnection() {
  try {
    console.log("Attempting to connect to MongoDB Atlas with DNS patch...");
    await mongoose.connect(testURI);
    console.log("🎉 SUCCESS! Your string connected cleanly to the Atlas cloud cluster.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ CONNECTION FAILED!");
    console.error("Reason:", error.message);
  }
}

checkConnection();