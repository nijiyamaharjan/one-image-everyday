import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './pages/ImageUpload';
import ImageDisplay from './pages/ImageDisplay';

const App = () => {
    const [photos, setPhotos] = useState([]);

    // Fetch photos on component mount
    useEffect(() => {
        // Fetch existing photos when the component mounts
        const fetchPhotos = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/photos/viewall');
                setPhotos(response.data);
            } catch (error) {
                console.error('Error fetching photos:', error);
            }
        };

        fetchPhotos();
    }, []);

    // Handle adding a new image
    const handleNewImage = (newPhoto) => {
        setPhotos(prevPhotos => [...prevPhotos, newPhoto, ]);
    };

    // Handle deleting an image
    const handleDeletePhoto = (id) => {
        // Filter out the deleted photo from the state
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== id));
    };

    return (
        <div>
            <h1>Photo Uploader</h1>
            {/* Upload form */}
            <ImageUpload onImageUpload={handleNewImage} />
            
            {/* Display uploaded photos with delete functionality */}
            <ImageDisplay photos={photos} onDelete={handleDeletePhoto} />
        </div>
    );
};

export default App;
