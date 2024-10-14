import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs'

const ImageDisplay = ({ photos, onDelete }) => {
    const [photoExistsMap, setPhotoExistsMap] = useState({})
    const [datesInRange, setDatesInRange] = useState([]);

    useEffect(() => {
        // Check for each photo's date if it exists
        const startDate = dayjs().startOf('month'); // Start of the current month
        const endDate = dayjs().endOf('month'); // End of the current month
        const generatedDates = [];

        // Generate the array of dates for the current month
        for (let date = startDate; date.isBefore(endDate.add(1, 'day')); date = date.add(1, 'day')) {
            generatedDates.push(date.format('YYYY-MM-DD'));
        }

        setDatesInRange(generatedDates); // Set the generated dates in state

        generatedDates.forEach(date => {
            checkIfPhotoExists(date); // Check for existence for each date
        });
    }, [photos]);

    const checkIfPhotoExists = async (selectedDate) => {
        if (photoExistsMap[selectedDate] !== undefined) return

        try {
            const response = await axios.get(`http://localhost:4000/api/photos/exists?date=${selectedDate}`);
            setPhotoExistsMap(prev => ({ ...prev, [selectedDate]: response.data.exists }))      
        } catch (error) {
            console.error('Error checking for photo:', error);
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
        <div>
            <h2 className="text-lg font-semibold mb-4">Uploaded Photos for the Month</h2>
            <div className="flex flex-row flex-wrap"> {/* Flexbox for wrapping images */}
                {datesInRange.map((date) => {
                    const photoForDate = photos.find(photo => dayjs(photo.date).format('YYYY-MM-DD') === date); // Find photo for the current date
                    const photoExists = photoExistsMap[date]; // Check existence for the current date
                    return (
                        <div key={date} className="relative w-48 h-48 overflow-hidden flex justify-center items-center m-0">
                            {/* Overlay for the date */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                <p>{dayjs(date).format('ddd')}</p>
                                <p className="font-bold text-xl">{dayjs(date).format('MMM')}</p>
                                <p className="font-bold text-2xl">{dayjs(date).format('DD')}</p>
                            </div>

                            {photoExists && photoForDate ? (
                                <img
                                    src={`http://localhost:4000/images/${photoForDate.photo}`}
                                    alt={photoForDate.date}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-500"></div> // Show a gray rectangle if no photo exists
                            )}

                            {/* Delete button for the existing photo */}
                            {photoForDate && (
                                <button
                                    className="absolute bottom-2 right-2 bg-white text-black text-xs px-2 py-1 rounded"
                                    onClick={() => handleDelete(photoForDate._id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImageDisplay;
