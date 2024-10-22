import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'
import isBetween from 'dayjs/plugin/isBetween'
// import Video from './Video'

dayjs.extend(isBetween);

const Slideshow = ({ photos }) => {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [filteredPhotos, setFilteredPhotos] = useState([])

    const handleDateFilter = () => {
        const filtered = photos.filter(photo =>
            dayjs(photo.date).isBetween(startDate, endDate, null, '[]')
        )
        setFilteredPhotos(filtered)
    }

    return (
        <div>
            <h1 className='my-3'>Create Video</h1>
            {/* <Video photos={photos} /> */}

            {/* Date Range Picker */}
            <input
                type="date"
                name="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            <input
                type="date"
                name="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleDateFilter}>Filter Photos</button>

            {/* Slideshow */}
            {filteredPhotos.length > 0 ? (
                <div>
                    <Slide>
                    {filteredPhotos.length > 0 ? (
                <div className="w-full">
                    <Slide>
                        {filteredPhotos.map((photo, index) => (
                            <div className="each-slide relative" key={index}>
                                <div
                                    className="h-[90vh] bg-cover bg-center relative"
                                    style={{
                                        backgroundImage: `url(http://localhost:4000/images/${photo.photo})`,
                                    }}
                                >
                                    {/* Text in the top-left corner */}
                                    <div className="absolute top-0 left-0 bg-black bg-opacity-50 p-4 text-white">
                                        <h3 className="text-xl font-bold">
                                            {dayjs(photo.date).format('MMMM DD, YYYY')}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slide>
                </div>
            ) : (
                <p>No photos found for the selected date range.</p>
            )}
                    </Slide>
                </div>
            ) : (
                <p>No photos found for the selected date range.</p>
            )}
        </div>
    )
}

export default Slideshow