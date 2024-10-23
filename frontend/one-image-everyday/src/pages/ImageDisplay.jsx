import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const ImageDisplay = ({ photos, onDelete }) => {
    const [photoExistsMap, setPhotoExistsMap] = useState({})
    const [datesInRange, setDatesInRange] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(dayjs())
    const navigate = useNavigate()

    useEffect(() => {
        const generateDatesForMonth = (month) => {
            const startDate = month.startOf('month');
            const endDate = month.endOf('month');
            const generatedDates = [];

            for (let date = startDate; date.isBefore(endDate.add(1, 'day')); date = date.add(1, 'day')) {
                generatedDates.push(date.format('YYYY-MM-DD'));
            }
            generatedDates.pop()
            return generatedDates;
        };

        const dates = generateDatesForMonth(currentMonth);
        setDatesInRange(dates);

        dates.forEach(date => {
            checkIfPhotoExists(date); // Check for existence for each date
        });
    }, [currentMonth, photos]);

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

    const handleUpload = (date) => {
        const formattedDate = date.split('T')[0];
        navigate(`/upload?date=${formattedDate}`);
    }
    

    const changeMonth = (direction) => {
        if (direction === 'prev') {
            setCurrentMonth(currentMonth.subtract(1, 'month')) // Move to the previous month
        } else if (direction === 'next') {
            setCurrentMonth(currentMonth.add(1, 'month')) // Move to the next month
        }
    };

    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='flex text-2xl font-semibold items-center justify-between mx-4 my-3'>
                <button
                 onClick={() => changeMonth('prev')}
                 className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition-colors duration-200">
                    ←
                </button>
                <p className='mx-4'>{currentMonth.format('MMMM YYYY')}</p>
                <button
                 onClick={() => changeMonth('next')}
                 className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition-colors duration-200">
                 →</button>
            </div>

            <div className="grid grid-cols-7 gap-0.5"> {/* Grid for wrapping images */}
                {/* Empty slots before the first day of the month */}
                {Array.from({ length: currentMonth.startOf('month').day() }).map((_, index) => (
                    <div key={index} className="w-full h-48 bg-transparent"></div>
                ))}

                {datesInRange.map((date) => {
                    const photoForDate = photos.find(photo => dayjs(photo.date).format('YYYY-MM-DD') === date); // Find photo for the current date
                    const photoExists = photoExistsMap[date]; // Check existence for the current date
                    return (
                        <div  key={date} className="flex flex-wrap">
                        <div className="relative w-48 h-48 overflow-hidden flex m-0">
                            {/* Overlay for the date */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                <p>{dayjs(date).format('ddd')}</p>
                                {/* <p className="font-bold text-xl">{dayjs(date).format('MMM')}</p> */}
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

                            {photoForDate && (
                                <>
                                {/* Delete button */}
                                <button
                                    className="absolute bottom-2 right-2 bg-white text-black text-xs px-2 py-1 rounded"
                                    onClick={() => handleDelete(photoForDate._id)}
                                >
                                    Delete
                                </button>                                
                                </>
                            )}
                            {/* Upload button */}
                            <button
                                    className="absolute top-2 right-2 bg-white text-black text-xs px-2 py-1 rounded"
                                    onClick={() => handleUpload(date)}
                                >
                                    Upload
                            </button>
                            </div>
                        </div>
                    );
                })}       
            </div>
            <div className='flex text-2xl font-semibold items-center justify-between mx-4 my-3'>
                <button
                 onClick={() => changeMonth('prev')}
                 className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition-colors duration-200">
                    ←
                </button>
                <p className='mx-4'>{currentMonth.format('MMMM YYYY')}</p>
                <button
                 onClick={() => changeMonth('next')}
                 className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition-colors duration-200">
                 →</button>
            </div>
        </div>
    );
};

export default ImageDisplay;

