import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './pages/ImageUpload';
import ImageDisplay from './pages/ImageDisplay';
import Video from './pages/Video';
import Login from './Login';
import { useLogout } from './hooks/useLogout';
import { useAuthContext } from './hooks/useAuthContext';
import { usePhotosContext } from './hooks/usePhotosContext';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Signup from './Signup';

const App = () => {
    const { photos } = usePhotosContext();
    const { logout } = useLogout();
    const { user } = useAuthContext();
    const { dispatch } = usePhotosContext();
    const [error, setError] = useState(null);

    const handleClick = () => {
        logout();
    };

    const fetchPhotos = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/photos/viewall', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            dispatch({ type: 'SET_PHOTOS', payload: response.data });
        } catch (error) {
            setError('Failed to fetch photos. Please try again later.');
            console.error('Error fetching photos:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPhotos();
        }
    }, [user]);

    const handleNewImage = async (newPhoto) => {
        await fetchPhotos(); // Fetch all photos after adding a new one
    };

    const handleDeletePhoto = async (id) => {
        dispatch({ type: 'DELETE_PHOTO', payload: id });
        await fetchPhotos(); // Fetch all photos after deleting one
    };

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-gray-500 text-white py-3 shadow-md">
                    <div className="container mx-auto flex flex-col items-center">
                        <h1 className="text-3xl font-bold mb-2">One Image Everyday</h1>
                        <nav className="flex space-x-4">
                            {!user && (
                                <>
                                    <Link to="/login" className="hover:text-gray-300">Login</Link>
                                    <p>|</p>
                                    <Link to="/signup" className="hover:text-gray-300">Signup</Link>
                                </>
                            )}
                            {user && (
                                <>
                                    <Link to="/upload" className="hover:text-gray-300">Upload</Link>
                                    <p>|</p>
                                    <Link to="/display" className="hover:text-gray-300">Display</Link>
                                    <p>|</p>
                                    <Link to="/video" className="hover:text-gray-300">Generate Video</Link>
                                    <p>|</p>
                                    <button onClick={handleClick} className="hover:text-gray-300">Log out</button>
                                    <p>|</p>
                                    <p className>{user.email}</p>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-grow container mx-auto py-8 px-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        {error && <p className="text-red-500">{error}</p>}
                        <Routes>
                            <Route
                                path="/upload"
                                element={
                                    <ImageUpload
                                        photos={photos || []}
                                        onImageUpload={handleNewImage}
                                        onDelete={handleDeletePhoto}
                                    />
                                }
                            />
                            <Route
                                path="/display"
                                element={
                                    <ImageDisplay 
                                        photos={photos || []} 
                                        onDelete={handleDeletePhoto}
                                        refreshPhotos={fetchPhotos}
                                    />
                                }
                            />
                            <Route path="/video" element={<Video photos={photos || []} />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
