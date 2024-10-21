import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './pages/ImageUpload';
import ImageDisplay from './pages/ImageDisplay';
import Slideshow from './pages/Slideshow'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const App = () => {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
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

    const handleNewImage = (newPhoto) => {
        setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
    };

    const handleDeletePhoto = (id) => {
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== id));
    };

    return (
        <BrowserRouter>
            <div>
                <h1>Photo Uploader</h1>
                <nav>
                    <Link to="/upload" className="mr-4">Upload</Link>
                    <Link to="/display" className='mr-4'>Display</Link>
                    <Link to="/slideshow" className='mr-4'>Generate Slideshow</Link>
                </nav>

                <Routes>
                    <Route path="/upload" element={<ImageUpload photos={photos} onImageUpload={handleNewImage} onDelete={handleDeletePhoto} />} />
                    <Route path="/display" element={<ImageDisplay photos={photos} onDelete={handleDeletePhoto} />} />
                    <Route path="/slideshow" element={<Slideshow photos={photos}/>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
