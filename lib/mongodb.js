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
            bufferCommands: false,           // Don't buffer — fail fast if not connected
            serverSelectionTimeoutMS: 10000, // Give up finding a server after 10s
            socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
        };

        cached.promise = mongoose.connect(uri, opts).then((m) => {
            console.log('MongoDB connected');
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null; // Reset so it retries on next request
        throw e;
    }

    return cached.conn;
}

module.exports = connectDB;
