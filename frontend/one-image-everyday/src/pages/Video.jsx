// import React, { useState } from 'react';
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// const SlideshowVideoCreator = ({ photos }) => {
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [filteredPhotos, setFilteredPhotos] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [videoUrl, setVideoUrl] = useState('');

//   const handleDateFilter = () => {
//     const filtered = photos.filter(photo =>
//       dayjs(photo.date).isBetween(startDate, endDate, null, '[]')
//     );
//     setFilteredPhotos(filtered);
//   };

//   const createSlideshowVideo = async () => {
//     setIsProcessing(true);
//     const ffmpeg = createFFmpeg({ log: true });
//     await ffmpeg.load();

//     for (let i = 0; i < filteredPhotos.length; i++) {
//       const photo = filteredPhotos[i];
//       const response = await fetch(`http://localhost:4000/images/${photo.photo}`);
//       const blob = await response.blob();
//       await ffmpeg.FS('writeFile', `image${i}.png`, await fetchFile(blob));
//     }

//     await ffmpeg.run('-r', '1', '-i', 'image%d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4');

//     const data = ffmpeg.FS('readFile', 'output.mp4');
//     const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

//     setVideoUrl(url);
//     setIsProcessing(false);
//   };

//   return (
//     <div>
//       <h1>Create Slideshow Video</h1>

//       {/* Date Range Picker */}
//       <input
//         type="date"
//         value={startDate}
//         onChange={(e) => setStartDate(e.target.value)}
//       />
//       <input
//         type="date"
//         value={endDate}
//         onChange={(e) => setEndDate(e.target.value)}
//       />
//       <button onClick={handleDateFilter}>Filter Photos</button>

//       {/* Generate Video */}
//       {filteredPhotos.length > 0 && (
//         <button onClick={createSlideshowVideo}>
//           {isProcessing ? 'Processing...' : 'Create Slideshow Video'}
//         </button>
//       )}

//       {/* Display the video */}
//       {videoUrl && (
//         <video src={videoUrl} controls></video>
//       )}
//     </div>
//   );
// };

// export default SlideshowVideoCreator;
