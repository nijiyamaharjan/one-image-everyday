import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './pages/ImageUpload';
import ImageDisplay from './pages/ImageDisplay';
import Slideshow from './pages/Slideshow'
import Video from './pages/Video'
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
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <header className="bg-blue-950 text-white py-3 shadow-md">
      <div className="container mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">One Image Everyday</h1>
        <nav className="flex space-x-4">
          <Link to="/upload" className="hover:text-gray-300">Upload</Link>
          <p>|</p>
          <Link to="/display" className="hover:text-gray-300">Display</Link>
          <p>|</p>
          <Link to="/slideshow" className="hover:text-gray-300">Generate Slideshow</Link>
          <p>|</p>
          <Link to="/video" className="hover:text-gray-300">Generate Video</Link>
        </nav>
      </div>
    </header>

    <main className="flex-grow container mx-auto py-8 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Routes>
          <Route
            path="/upload"
            element={
              <ImageUpload
                photos={photos}
                onImageUpload={handleNewImage}
                onDelete={handleDeletePhoto}
              />
            }
          />
          <Route
            path="/display"
            element={<ImageDisplay photos={photos} onDelete={handleDeletePhoto} />}
          />
          <Route path="/slideshow" element={<Slideshow photos={photos} />} />
          <Route path="/video" element={<Video photos={photos} />} />
        </Routes>
      </div>
    </main>
  </div>
</BrowserRouter>
    );
};

export default App;
