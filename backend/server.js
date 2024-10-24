require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const photoRoutes = require('./routes/photos');
const userRoutes = require('./routes/user');

const app = express();

// Global CORS configuration with required headers for FFmpeg
app.use(cors({
    origin: 'http://localhost:5173', // Update this for production
    credentials: true,
}));

// Set security headers for all routes
app.use((req, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Cross-Origin-Embedder-Policy', 'credentialless'); // Changed from require-corp
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

// Middleware to log requests
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use('/images', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    express.static(path.join(__dirname, 'images'))(req, res, next);
});

// Serve FFmpeg files from node_modules (if you're using @ffmpeg/ffmpeg)
app.use('/ffmpeg', express.static(path.join(__dirname, 'node_modules/@ffmpeg/core/dist')));

// Routes
app.use('/api/photos', photoRoutes);
app.use('/api/user', userRoutes )

// Explicit routes for FFmpeg files
app.get('/ffmpeg/ffmpeg-core.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js'));
});

app.get('/ffmpeg/ffmpeg-core.wasm', (req, res) => {
    res.setHeader('Content-Type', 'application/wasm');
    res.sendFile(path.join(__dirname, 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm'));
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/oneImageEveryday')
    .then(() => {
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Connected to DB and listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

