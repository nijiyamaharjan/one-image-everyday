import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { useNavigate } from 'react-router-dom';

const ImageUpload = ({ photos, onImageUpload, onDelete }) => {
    const [newPhoto, setNewPhoto] = useState({
        photo: null, // Initialize as null instead of an empty string
        date: ''
    });

    const [photoExists, setPhotoExists] = useState(false);
    const [preview, setPreview] = useState('');

    const navigate = useNavigate();
    const photoForDate = photos.find(photo => dayjs(photo.date).format('YYYY-MM-DD') === newPhoto.date); // Find photo for the current date

    useEffect(() => {
        const params = new URLSearchParams(window.location.search); // Use window.location to get query params
        const dateParam = params.get('date');
        const photoExistsParam = params.get('exists') === 'true'; // Parse 'exists' param as boolean

        if (dateParam) {
            setNewPhoto(prevState => ({ ...prevState, date: dateParam }));
            setPhotoExists(photoExistsParam); // Set state from URL param if photo exists
            if (!photoExistsParam) {
                checkIfPhotoExists(dateParam); // Check if photo exists for the preselected date only if not already set
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
            setNewPhoto({ ...newPhoto, photo: selectedFile }); // Correctly set the new photo state
        }
    };

    const handleDate = async (e) => {
        const selectedDate = e.target.value;
        setNewPhoto({ ...newPhoto, date: selectedDate });
        checkIfPhotoExists(selectedDate); // Check if a photo exists for the newly selected date
    };

    const checkIfPhotoExists = async (selectedDate) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/photos/exists?date=${selectedDate}`);
            setPhotoExists(response.data.exists); // Update the state based on response
            onImageUpload(response.data); // Call the callback
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

                    // Convert the canvas to a blob in PNG format
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

        try {
            const pngFile = await convertToPng(newPhoto.photo);
            const formData = new FormData();
            formData.append('photo', pngFile);
            formData.append('date', newPhoto.date);

            // If a photo exists, the new one will overwrite it
            const response = await axios.post('http://localhost:4000/api/photos/add', formData);
            const uploadedPhoto = response.data;

            if (photoExists) {
                handleDelete(photoForDate._id);
            }

            onImageUpload(uploadedPhoto); // Call the callback with the uploaded photo data
            console.log('Image uploaded', response.data);
            navigate("/display"); // Redirect to display page
        } catch (err) {
            console.error('Error uploading photo:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:4000/api/photos/delete/${id}`);
            console.log(response.data);
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

                <div class="flex items-center justify-center w-full">
                <label for="dropzone-file" class="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-2 text-sm"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                            <p class="text-xs">PNG or JPG</p>
                        </div>
                        <input id="dropzone-file" type="file" accept=".png, .jpg, .jpeg" onChange={handlePhoto} class="hidden" />
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
                 className="bg-blue-500 my-2 text-white px-4 py-2 rounded hover:bg-blue-600" />

                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-64 h-auto object-cover"
                    />
                )}
                {photoExists && (
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
