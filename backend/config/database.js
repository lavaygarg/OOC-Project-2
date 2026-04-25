const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        const isProduction = process.env.NODE_ENV === 'production';
        
        if (!mongoURI) {
            console.error('MONGODB_URI is not defined in environment variables');
            process.exit(1);
        }

        const mongooseOptions = {
            dbName: 'hope-foundation',
            tls: true
        };

        if (!isProduction) {
            mongooseOptions.tlsAllowInvalidCertificates = true;
        }

        const conn = await mongoose.connect(mongoURI, {
            ...mongooseOptions
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
