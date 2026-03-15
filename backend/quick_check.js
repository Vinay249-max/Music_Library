const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    console.log('Script started');
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected');
        
        const Song = mongoose.model('Song', new mongoose.Schema({}));
        const User = mongoose.model('User', new mongoose.Schema({}));
        
        const songCount = await Song.countDocuments();
        const userCount = await User.countDocuments();
        
        console.log('Songs found:', songCount);
        console.log('Users found:', userCount);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

check();
