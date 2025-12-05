const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value) {
            envVars[key] = value;
        }
    }
});

// Construct direct connection string from discovered hosts
const MONGODB_URI = 'mongodb://abdulrehmanmuhammad524_db_user:wzBbWvnBbmorwhCA@ac-qcq34ez-shard-00-00.2npgalj.mongodb.net:27017,ac-qcq34ez-shard-00-01.2npgalj.mongodb.net:27017,ac-qcq34ez-shard-00-02.2npgalj.mongodb.net:27017/intraview-ai?ssl=true&replicaSet=atlas-13rizr-shard-0&authSource=admin&retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');
const maskedURI = MONGODB_URI ? MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED';
console.log('URI:', maskedURI);

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function testConnection() {
    try {
        console.log('Attempting to connect with permissive SSL options...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4, // Force IPv4
            tls: true,
            tlsInsecure: true,
        });
        console.log('✅ Connection successful!');
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testConnection();
