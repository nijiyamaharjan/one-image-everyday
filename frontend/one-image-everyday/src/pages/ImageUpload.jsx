import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { useNavigate } from 'react-router-dom';

const ImageUpload = ({photos, onImageUpload, onDelete }) => {
    const [newPhoto, setNewPhoto] = useState({
        photo: null, // Initialize as null instead of an empty string
        date: ''
    });

    const [photoExists, setPhotoExists] = useState(false)
    const [preview, setPreview] = useState('')

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
                URL.revokeObjectURL(preview)
            }
        }
    }, [preview]);

    const handlePhoto = (e) => {
        const selectedFile = e.target.files[0]

        if (selectedFile) {
            const previewUrl = URL.createObjectURL(selectedFile)
            setPreview(previewUrl)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('photo', newPhoto.photo);
        formData.append('date', newPhoto.date);

        try {
            // If a photo exists, the new one will overwrite it
            const response = await axios.post('http://localhost:4000/api/photos/add', formData);
            const uploadedPhoto = response.data;
            if (photoExists) {
                handleDelete(photoForDate._id)
            }
            onImageUpload(uploadedPhoto); // Call the callback with the uploaded photo data
            console.log('Image uploaded', response.data)
            navigate("/display"); // Redirect to display page
        } catch (err) {
            console.error('Error uploading photo:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:4000/api/photos/delete/${id}`)
            console.log(response.data)
            onDelete(id)
        } catch(error) {
            console.error('Error deleting the photo: ', error)
        }
    }

    return (
        <div className='w-96 h-720'>
        <form onSubmit={handleSubmit} encType='multipart/form-data'>
            <input
                type="file"
                accept=".png, .jpg, .jpeg"
                name="photo"
                onChange={handlePhoto}
            />
            <input
                type="date"
                name="date"
                value={newPhoto.date}
                onChange={handleDate}
            />
            
            <input type="submit" value={photoExists ? "Overwrite Photo" : "Upload Photo"} />

            {preview && (
                <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
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
