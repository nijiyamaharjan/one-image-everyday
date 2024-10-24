import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ImageDisplay = ({ photos = [], onDelete, refreshPhotos }) => {
    const [photoExistsMap, setPhotoExistsMap] = useState({});
    const [datesInRange, setDatesInRange] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const navigate = useNavigate();
    const { user } = useAuthContext();
    
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch photos when component mounts
        refreshPhotos();
    }, [user, navigate]); // Only run on mount and when user changes

    useEffect(() => {
        const generateDatesForMonth = (month) => {
            const startDate = month.startOf('month');
            const endDate = month.endOf('month');
            const generatedDates = [];

            for (let date = startDate; date.isBefore(endDate.add(1, 'day')); date = date.add(1, 'day')) {
                generatedDates.push(date.format('YYYY-MM-DD'));
            }
            return generatedDates;
        };

        const dates = generateDatesForMonth(currentMonth);
        setDatesInRange(dates);

        const photoArray = Array.isArray(photos) ? photos : [];
        
        const newPhotoExistsMap = {};
        dates.forEach(date => {
            const hasPhoto = photoArray.some(photo => 
                dayjs(photo.date).format('YYYY-MM-DD') === date
            );
            newPhotoExistsMap[date] = hasPhoto;
        });
        setPhotoExistsMap(newPhotoExistsMap);
        
    }, [currentMonth, photos]);

    const handleDelete = async (id) => {
        if (!user || !user.token) return;

        try {
            await axios.delete(`http://localhost:4000/api/photos/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            onDelete(id);
            await refreshPhotos(); // Refresh photos after deletion
            
        } catch (error) {
            console.error('Error deleting the photo: ', error);
        }
    };

    const handleUpload = (date) => {
        navigate(`/upload?date=${date}&exists=${photoExistsMap[date]}`);
    };

    const changeMonth = (direction) => {
        if (direction === 'prev') {
            setCurrentMonth(prev => prev.subtract(1, 'month'));
        } else if (direction === 'next') {
            setCurrentMonth(prev => prev.add(1, 'month'));
        }
    };

    // Ensure photos is an array for the render phase
    const photoArray = Array.isArray(photos) ? photos : [];

    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='flex text-2xl font-semibold items-center justify-between mx-4 my-3'>
                <button
                    onClick={() => changeMonth('prev')}
                    className='text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition-colors duration-200'
                >
                    ←
                </button>
                <p className='mx-4'>{currentMonth.format('MMMM YYYY')}</p>
                <button
                    onClick={() => changeMonth('next')}
                    className='text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded transition-colors duration-200'
                >
                    →
                </button>
            </div>

            <div className='grid grid-cols-7 gap-0.5'>
                {Array.from({ length: currentMonth.startOf('month').day() }).map((_, index) => (
                    <div key={`empty-${index}`} className='w-full h-48 bg-transparent'></div>
                ))}

                {datesInRange.map((date) => {
                    const photoForDate = photoArray.find(photo => 
                        dayjs(photo.date).format('YYYY-MM-DD') === date
                    );
                    
                    return (
                        <div key={date} className='flex flex-wrap'>
                            <div className='relative w-48 h-48 overflow-hidden flex m-0'>
                                <div className='absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded'>
                                    <p>{dayjs(date).format('ddd')}</p>
                                    <p className='font-bold text-2xl'>{dayjs(date).format('DD')}</p>
                                </div>

                                {photoForDate ? (
                                    <img
                                        src={`http://localhost:4000/images/${photoForDate.photo}`}
                                        alt={photoForDate.date}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full bg-gray-400'></div>
                                )}

                                {photoForDate && (
                                    <button
                                        className='absolute bottom-2 right-2 bg-white text-black text-xs px-2 py-1 rounded'
                                        onClick={() => handleDelete(photoForDate._id)}
                                    >
                                        Delete
                                    </button>
                                )}
                                
                                <button
                                    className='absolute top-2 right-2 bg-white text-black text-xs px-2 py-1 rounded'
                                    onClick={() => handleUpload(date)}
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImageDisplay;