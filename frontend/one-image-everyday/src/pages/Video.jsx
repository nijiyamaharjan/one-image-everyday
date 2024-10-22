import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

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

      // Process each photo
      for (let i = 0; i < filteredPhotos.length; i++) {
        const photo = filteredPhotos[i];
        
        try {
          const response = await fetch(`http://localhost:4000/images/${photo.photo}`, {
            mode: 'cors',
            credentials: 'same-origin'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image ${i + 1}`);
          }
          
          const blob = await response.blob();
          await ffmpeg.writeFile(`image${i}.png`, await fetchFile(blob));
          
        } catch (fetchError) {
          throw new Error(`Failed to process image ${i + 1}: ${fetchError.message}`);
        }
      }

      // Create video with transition effects
      await ffmpeg.exec([
        '-framerate', '1',  // 1 seconds per image
        '-i', 'image%d.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fade=t=in:st=0:d=1:alpha=1,fade=t=out:st=1:d=1:alpha=1[v]',
        '-movflags', '+faststart',
        '-preset', 'medium',
        '-crf', '23',
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
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