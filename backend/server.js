require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const photoRoutes = require('./routes/photos');

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Update this for production
}));

// Middleware to log requests
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Middleware to parse JSON
app.use(express.json());

// Middleware to serve static files (images)
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve images from the 'images' directory

// Routes
app.use('/api/photos', photoRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/oneImageEveryday')
    .then(() => {
        const PORT = process.env.PORT || 4000; // Use the port from .env or default to 4000
        app.listen(PORT, () => {
            console.log(`Connected to DB and listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message); // Log error message
    });
