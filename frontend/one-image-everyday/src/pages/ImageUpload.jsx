import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = ({ onImageUpload }) => {
    const [newPhoto, setNewPhoto] = useState({
        photo: null, // Initialize as null instead of an empty string
        date: ''
    });

    const [photoExists, setPhotoExists] = useState(false)

    const handlePhoto = (e) => {
        const selectedFile = e.target.files[0];
        setNewPhoto({ ...newPhoto, photo: selectedFile }); // Correctly set the new photo state
        console.log(selectedFile); // Log the selected file directly
    };

    const handleDate = async (e) => {
        const selectedDate = e.target.value;
        setNewPhoto({ ...newPhoto, date: selectedDate});
        console.log(selectedDate); // Log the selected date
        checkIfPhotoExists(e.target.value)
    };

    const checkIfPhotoExists = async (selectedDate) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/photos/exists?date=${selectedDate}`);
            setPhotoExists(response.data.exists); // Update the state based on response
            onImageUpload(response.data)
        } catch (error) {
            console.error('Error checking for photo:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('photo', newPhoto.photo);
        formData.append('date', newPhoto.date);

        console.log(newPhoto); // Log to verify the file is set

        try {
            // Update the URL to include '/api'
            const response = await axios.post('http://localhost:4000/api/photos/add', formData);
            const uploadedPhoto = response.data;

            console.log(response.data); // Log the response data
            onImageUpload(uploadedPhoto);
        } catch (err) {
            console.error(err); // Use console.error for error logging
        }
    };

    return (
        <form onSubmit={handleSubmit} encType='multipart/form-data'> {/* Corrected encType */}
            <input
                type="file"
                accept=".png, .jpg, .jpeg"
                name="photo"
                onChange={handlePhoto}
            />
            <input
                type="date"
                name="date"
                onChange={handleDate}
            />

            {photoExists && <p className="text-red-500">A photo already exists for this date.</p>}

            <input type="submit" disabled={photoExists}/>
        </form>
    );
};

export default ImageUpload;
