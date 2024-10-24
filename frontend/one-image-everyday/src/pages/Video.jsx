import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAuthContext } from '../hooks/useAuthContext';

dayjs.extend(isBetween);

const SlideshowVideoCreator = ({ photos }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [ffmpeg, setFfmpeg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthContext()

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        
        console.log('Loading FFmpeg...');

        // Configure FFmpeg with cross-origin isolation headers
        ffmpegInstance.on('log', ({ message }) => {
        console.log('FFmpeg Log:', message);
        });

        // Load FFmpeg
        await ffmpegInstance.load({
          coreURL: 'http://localhost:4000/ffmpeg/ffmpeg-core.js',
          wasmURL: 'http://localhost:4000/ffmpeg/ffmpeg-core.wasm',
        });

        console.log('FFmpeg loaded successfully');

        setFfmpeg(ffmpegInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading FFmpeg:', err);
        setError('Failed to initialize video processing. Please check your connection and try again.');
        setIsLoading(false);
      }
    };

    loadFFmpeg();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  const handleDateFilter = () => {
    try {
      const adjustedEndDate = dayjs(endDate).add(1, 'day'); // Add one day to the end date
      const filtered = photos.filter(photo =>
        dayjs(photo.date).isBetween(startDate, adjustedEndDate, null, '[]') // Adjusted date range
      );
      console.log(filtered)
      setFilteredPhotos(filtered);
      setError('');
    } catch (err) {
      setError('Error filtering photos. Please check your date range.');
    }
  };

    const createSlideshowVideo = async () => {
      if (!ffmpeg || filteredPhotos.length === 0) return;
      try {
          setIsProcessing(true);
          setError('');
          
          // Create a canvas for text overlay
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 1280;
          canvas.height = 720;
          
          // Process each photo with canvas text overlay
          for (let i = 0; i < filteredPhotos.length; i++) {
              const photo = filteredPhotos[i];
              
              try {
                  const response = await fetch(`http://localhost:4000/images/${photo.photo}`, {
                      mode: 'cors',
                      credentials: 'same-origin', 
                      headers: {
                          Authorization: `Bearer ${user.token}`,
                      }
                  });
                  
                  if (!response.ok) {
                      throw new Error(`Failed to fetch image ${i + 1}`);
                  }
                  
                  // Create an image element and load the photo
                  const img = new Image();
                  const blob = await response.blob();
                  const imageUrl = URL.createObjectURL(blob);
                  
                  await new Promise((resolve, reject) => {
                      img.onload = resolve;
                      img.onerror = reject;
                      img.src = imageUrl;
                  });
                  
                  // Clear canvas
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  // Calculate scaling and positioning to maintain aspect ratio
                  const scale = Math.min(
                      canvas.width / img.width,
                      canvas.height / img.height
                  );
                  const x = (canvas.width - img.width * scale) / 2;
                  const y = (canvas.height - img.height * scale) / 2;
                  
                  // Draw black background
                  ctx.fillStyle = 'black';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
                  // Draw image
                  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                  
                  // Format date
                  const date = new Date(photo.date);
                  const dateText = date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                  });
                  
                  // Add text
                  ctx.font = 'bold 36px Arial';
                  ctx.textAlign = 'center';
                  
                  // Draw text shadow
                  ctx.fillStyle = 'black';
                  for (let offset = 0; offset < 3; offset++) {
                      ctx.fillText(
                          dateText,
                          canvas.width / 2 + offset,
                          canvas.height - 40 + offset
                      );
                  }
                  
                  // Draw main text
                  ctx.fillStyle = 'white';
                  ctx.fillText(dateText, canvas.width / 2, canvas.height - 40);
                  
                  // Convert canvas to blob and write to FFmpeg
                  const processedBlob = await new Promise(resolve => {
                      canvas.toBlob(resolve, 'image/png');
                  });
                  await ffmpeg.writeFile(`processed${i}.png`, await fetchFile(processedBlob));
                  
                  // Cleanup
                  URL.revokeObjectURL(imageUrl);
              } catch (fetchError) {
                  throw new Error(`Failed to process image ${i + 1}: ${fetchError.message}`);
              }
          }

          // Create filter complex for concatenation
          let filterComplex = '';
          let inputs = '';
          let overlayChain = '';

          // Build the filter complex string
          for (let i = 0; i < filteredPhotos.length; i++) {
              inputs += `-i processed${i}.png `;
              filterComplex += `[${i}:v]setpts=PTS-STARTPTS+${i}*2/TB[v${i}];`;
              overlayChain += `[v${i}]`;
          }

          // Add concatenation
          filterComplex += `${overlayChain}concat=n=${filteredPhotos.length}:v=1:a=0[outv]`;

          // Create the final video
          await ffmpeg.exec([
              ...inputs.trim().split(' '),
              '-filter_complex', filterComplex,
              '-map', '[outv]',
              '-c:v', 'libx264',
              '-preset', 'ultrafast',
              '-pix_fmt', 'yuv420p',
              'final_output.mp4'
          ]);

          // Read and create URL for the final video
          const data = await ffmpeg.readFile('final_output.mp4');
          const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
          setVideoUrl(url);
      } catch (err) {
          console.error('Error creating video:', err);
          setError(`Error creating video: ${err.message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Loading Video Creator</p>
        <p>Please wait while we initialize the video processing tools...</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">Create Slideshow Video</h1>

      <div className="space-y-4 flex flex-col justify-center items-center">
        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button 
            onClick={handleDateFilter}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Filter Photos
          </button>
        </div>

        {filteredPhotos.length > 0 && (
          <div className="space-y-2 flex flex-col items-center justify-center">
            <button 
              onClick={createSlideshowVideo}
              disabled={isProcessing}
              className={`bg-green-500 text-white px-4 py-2 rounded ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Create Slideshow Video'}
            </button>
            <p className="text-gray-600">
              {filteredPhotos.length} photos selected
            </p>
          </div>
        )}

        {error && (
          <p>Error: {error}</p>
        )}

        {videoUrl && (
          <div className="mt-4">
            <video 
              src={videoUrl} 
              controls
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideshowVideoCreator;