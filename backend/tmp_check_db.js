const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function checkDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases available:', dbs.databases.map(db => db.name));

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            console.log(`\nChecking database: ${dbName}`);
            const connection = mongoose.connection.useDb(dbName);
            const collections = await connection.db.listCollections().toArray();
            console.log(`Collections in ${dbName}:`, collections.map(c => c.name));
            
            for (const collection of collections) {
                const count = await connection.db.collection(collection.name).countDocuments();
                console.log(`- ${collection.name}: ${count} documents`);
            }
        }

        await mongoose.disconnect();
        console.log('\nDisconnected.');
    } catch (error) {
        console.error('Error checking databases:', error);
    }
}

checkDatabase();
