import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const ImageUpload = ({ photos = [], onImageUpload, onDelete }) => {
    const { user } = useAuthContext()
    const [newPhoto, setNewPhoto] = useState({
        photo: null,
        date: ''
    });

    const [photoExists, setPhotoExists] = useState(false);
    const [preview, setPreview] = useState('');

    const navigate = useNavigate();
    
    // Add null check before using find
    const photoForDate = Array.isArray(photos) 
        ? photos.find(photo => dayjs(photo.date).format('YYYY-MM-DD') === newPhoto.date)
        : undefined;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dateParam = params.get('date');
        const photoExistsParam = params.get('exists') === 'true';

        if (dateParam) {
            setNewPhoto(prevState => ({ ...prevState, date: dateParam }));
            setPhotoExists(photoExistsParam);
            if (!photoExistsParam) {
                checkIfPhotoExists(dateParam);
            }
        }

        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handlePhoto = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const previewUrl = URL.createObjectURL(selectedFile);
            setPreview(previewUrl);
            setNewPhoto({ ...newPhoto, photo: selectedFile });
        }
    };

    const handleDate = async (e) => {
        const selectedDate = e.target.value;
        setNewPhoto({ ...newPhoto, date: selectedDate });
        checkIfPhotoExists(selectedDate);
    };

    const checkIfPhotoExists = async (selectedDate) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/photos/exists?date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setPhotoExists(response.data.exists);
            onImageUpload(response.data);
        } catch (error) {
            console.error('Error checking for photo:', error);
        }
    };

    const convertToPng = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], `${newPhoto.date}.png`, { type: 'image/png' }));
                    }, 'image/png');
                };
                img.src = event.target.result;
            };

            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPhoto.photo) return;
    
        if (!user) {
            return;
        }
    
        try {
            const pngFile = await convertToPng(newPhoto.photo);
            const formData = new FormData();
            formData.append('photo', pngFile);
            formData.append('date', newPhoto.date);
    
            const response = await axios.post('http://localhost:4000/api/photos/add', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            const uploadedPhoto = response.data;
    
            if (photoExists && photoForDate) {
                handleDelete(photoForDate._id);
            }
    
            onImageUpload(uploadedPhoto);
            navigate("/display");
        } catch (err) {
            console.error('Error uploading photo:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            if (!user) {
                return
            }
            const response = await axios.delete(`http://localhost:4000/api/photos/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            onDelete(id);
        } catch (error) {
            console.error('Error deleting the photo: ', error);
        }
    };

    return (
        <div className='p-4 flex flex-col justify-center items-center'>
            <form
                onSubmit={handleSubmit}
                encType='multipart/form-data'
                className='flex flex-col items-center justify-center'
            >
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs">PNG or JPG</p>
                        </div>
                        <input id="dropzone-file" type="file" accept=".png, .jpg, .jpeg" onChange={handlePhoto} className="hidden" />
                    </label>
                </div>

                <input
                    type="date"
                    name="date"
                    value={newPhoto.date}
                    onChange={handleDate}
                    className="border my-2 p-2 rounded text-center"
                />

                <input
                    type="submit"
                    value={photoExists ? "Overwrite Photo" : "Upload Photo"}
                    className="bg-blue-500 my-2 text-white px-4 py-2 rounded hover:bg-blue-600"
                />

                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-64 h-auto object-cover"
                    />
                )}
                {photoExists && photoForDate && (
                    <img
                        src={`http://localhost:4000/images/${photoForDate.photo}`}
                        alt={photoForDate.date}
                        className="w-full h-full object-cover"
                    />
                )}
            </form>
        </div>
    );
};

export default ImageUpload;