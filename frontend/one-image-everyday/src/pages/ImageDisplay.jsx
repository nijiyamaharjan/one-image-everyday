import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ImageDisplay = ({ photos, onDelete }) => {
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
        console.log('Generated dates:', dates);

        // Set initial photoExistsMap based on photos prop
        const newPhotoExistsMap = {};
        dates.forEach(date => {
            const hasPhoto = photos.some(photo => 
                dayjs(photo.date).format('YYYY-MM-DD') === date
            );
            newPhotoExistsMap[date] = hasPhoto;
        });
        setPhotoExistsMap(newPhotoExistsMap);
        
    }, [currentMonth, photos, user, navigate]);

    const handleDelete = async (id) => {
        if (!user || !user.token) return;

        try {
            const response = await axios.delete(`http://localhost:4000/api/photos/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            console.log(response.data);
            onDelete(id);
            
            const deletedPhoto = photos.find(photo => photo._id === id);
            if (deletedPhoto) {
                const dateKey = dayjs(deletedPhoto.date).format('YYYY-MM-DD');
                setPhotoExistsMap(prev => ({ ...prev, [dateKey]: false }));
            }
        } catch (error) {
            console.error('Error deleting the photo: ', error);
        }
    };

    const handleUpload = (date) => {
        navigate(`/upload?date=${date}`);
    };

    const changeMonth = (direction) => {
        if (direction === 'prev') {
            setCurrentMonth(prev => prev.subtract(1, 'month'));
        } else if (direction === 'next') {
            setCurrentMonth(prev => prev.add(1, 'month'));
        }
    };

    console.log('Current month:', currentMonth.format('YYYY-MM'));
    console.log('Photos prop:', photos);
    console.log('PhotoExistsMap:', photoExistsMap);

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
                    const photoForDate = photos.find(photo => {
                        const photoDate = dayjs(photo.date).format('YYYY-MM-DD');
                        const matches = photoDate === date;
                        if (matches) {
                            console.log('Found photo for date:', date, photo);
                        }
                        return matches;
                    });
                    
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
                                        onError={(e) => console.error('Image failed to load:', e)}
                                        onLoad={() => console.log('Image loaded successfully')}
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