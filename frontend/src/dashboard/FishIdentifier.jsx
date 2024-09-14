import React, { useState, useRef } from 'react';
import { MdCamera, MdCameraEnhance } from 'react-icons/md';
import styles from './FishIdentifier.module.css';

const FishIdentifier = () => {
  const [image, setImage] = useState(null);
  const [fishInfo, setFishInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing the camera", err);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setImage(blob);
    }, 'image/jpeg');
  };

  const analyzeFish = async () => {
    if (!image) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', image, 'fish.jpg');

    try {
      const response = await fetch('http://localhost:3001/identify-fish', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze fish');

      const data = await response.json();
      setFishInfo(data);
    } catch (error) {
      console.error('Error analyzing fish:', error);
      alert('Failed to analyze fish. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fish Identifier</h1>
      
      <div className={styles.cameraContainer}>
        <video ref={videoRef} className={styles.video} autoPlay playsInline />
        <canvas ref={canvasRef} className={styles.canvas} />
        {!image && (
          <button onClick={startCamera} className={styles.startButton}>
            <MdCamera /> Start Camera
          </button>
        )}
        {image && (
          <img src={URL.createObjectURL(image)} alt="Captured fish" className={styles.capturedImage} />
        )}
      </div>

      <div className={styles.buttonContainer}>
        {!image ? (
          <button onClick={captureImage} className={styles.captureButton}>
            <MdCameraEnhance /> Capture Fish
          </button>
        ) : (
          <button onClick={analyzeFish} className={styles.analyzeButton} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Fish'}
          </button>
        )}
      </div>

      {fishInfo && (
        <div className={styles.fishInfoCard}>
          <h2>{fishInfo.fishName}</h2>
          <div className={styles.infoRow}>
            <span>Rarity:</span>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{width: `${fishInfo.rarity * 10}%`}}></div>
            </div>
            <span>{fishInfo.rarity}/10</span>
          </div>
          <div className={styles.infoRow}>
            <span>Score:</span>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{width: `${fishInfo.score}%`}}></div>
            </div>
            <span>{fishInfo.score}/100</span>
          </div>
          <p><strong>Habitat:</strong> {fishInfo.habitat}</p>
        </div>
      )}
    </div>
  );
};

export default FishIdentifier;