const mongoose = require('mongoose');

// Cache the connection on the global object so warm Lambda instances reuse it
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(uri) {
    // If already connected, return the existing connection immediately
    if (cached.conn) {
        return cached.conn;
    }

    // If a connection is in progress, wait for it (avoid creating multiple connections)
    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(uri, opts).then((m) => {
            console.log('MongoDB connected');
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

module.exports = connectDB;
