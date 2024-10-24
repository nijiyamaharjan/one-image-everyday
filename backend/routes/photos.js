const router = require('express').Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Photo = require('../models/photoModel');
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

// Ensure the images directory exists
const dir = 'images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Set up storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Create multer instance
const upload = multer({ storage, fileFilter });

// Add new photo
router.route('/add').post(upload.single('photo'), (req, res) => {
    const photo = req.file.filename;
    const date = req.body.date || new Date().toISOString();
    const user_id = req.user._id

    const newPhotoData = { photo, date, user_id};
    const newPhoto = new Photo(newPhotoData);

    newPhoto.save()
        .then(savedPhoto => res.json(savedPhoto))  // Ensure the response sends back the saved photo
        .catch(err => res.status(400).json('Error: ' + err));
});

// Retrieve all photos
router.route('/viewall').get(async (req, res) => {
    const user_id = req.user._id
    try {
        const photos = await Photo.find({ user_id });
        console.log('user_id', user_id)
        res.json(photos);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error: ' + err.message });
    }
});

// Delete a photo
router.route('/delete/:id').delete((req, res) => {
    const { id } = req.params;

    // Find the photo by ID in the database
    Photo.findById(id)
        .then(photo => {
            if (!photo) {
                return res.status(404).json({ error: 'Photo not found' });
            }

            // Delete the file from the file system
            const filePath = path.join(__dirname, '../images/', photo.photo);
            fs.unlink(filePath, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting file' });
                }

                // Once the file is deleted, remove the database entry
                Photo.findByIdAndDelete(id)
                    .then(() => res.json({ message: 'Photo deleted successfully' }))
                    .catch(err => res.status(500).json({ error: 'Error deleting from database' }));
            });
        })
        .catch(err => res.status(500).json({ error: 'Error finding photo' }));
});
  
router.route('/exists').get(async (req, res) => {
    const { date } = req.query; // Get the date from query parameters
    const user_id = req.user_id
    try {
        const photo = await Photo.findOne({ date, user_id }); // Check for a photo with the specified date
        if (photo) {
            return res.json({ exists: true, photo });
        }
        return res.json({ exists: false });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
