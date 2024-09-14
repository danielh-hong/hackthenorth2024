import React, { useState, useRef, useEffect, useContext } from 'react';
import { MdCamera, MdFileUpload, MdAutorenew, MdAnalytics } from 'react-icons/md';
import { UserContext } from '../UserContext'; // Adjust the import path as needed
import styles from './FishIdentifier.module.css';

const FishIdentifier = () => {
  const [image, setImage] = useState(null);
  const [fishInfo, setFishInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const analyzeFish = async () => {
    if (!image || !user) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', image, 'fish.jpg');
    formData.append('username', user.username);

    try {
      const response = await fetch('http://localhost:3001/identify-fish', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze fish');

      const data = await response.json();
      setFishInfo({
        ...data,
        dateCaught: new Date().toLocaleString(),
        joke: generateFishJoke(data.fishName)
      });
    } catch (error) {
      console.error('Error analyzing fish:', error);
      alert('Failed to analyze fish. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCapture = () => {
    setImage(null);
    setFishInfo(null);
    startCamera();
  };

  const generateFishJoke = (fishName) => {
    const jokes = [
      `Why was the ${fishName} bad at basketball? It was always getting caught in the net!`,
      `What do you call a ${fishName} wearing a bowtie? So-fish-ticated!`,
      `How does a ${fishName} go to war? In a tank!`,
      `Why don't ${fishName}s play soccer? They're afraid of the net!`,
      `What do you call a ${fishName} with no eyes? Fsh!`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  };

  if (!user) {
    return <div>Please log in to use the Fish Identifier.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AquaScan</h1>
      <p className={styles.description}>
        Capture or upload an image of a fish, and let our AI identify it for you. 
        Discover the species, rarity, and get a fun fact about your catch!
      </p>
      
      <div className={styles.captureContainer}>
        <div className={styles.cameraContainer}>
          <video ref={videoRef} className={styles.video} autoPlay playsInline />
          <canvas ref={canvasRef} className={styles.canvas} />
          {image && (
            <img src={URL.createObjectURL(image)} alt="Captured fish" className={styles.capturedImage} />
          )}
        </div>

        <div className={styles.actionButtons}>
          {!image && cameraActive && (
            <button onClick={captureImage} className={styles.actionButton}>
              <MdCamera /> Capture
            </button>
          )}
          <button onClick={() => fileInputRef.current.click()} className={styles.actionButton}>
            <MdFileUpload /> Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          {image && (
            <>
              <button onClick={analyzeFish} className={styles.actionButton} disabled={isLoading}>
                <MdAnalytics /> {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button onClick={resetCapture} className={styles.actionButton}>
                <MdAutorenew /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {fishInfo && (
        <div className={styles.fishInfoCard}>
          <h2>You caught a {fishInfo.fishName}!</h2>
          <p className={styles.fishJoke}>{fishInfo.joke}</p>
          <div className={styles.infoRow}>
            <span>Rarity:</span>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{width: `${fishInfo.rarityScore * 10}%`}}></div>
            </div>
            <span>{fishInfo.rarityScore}/10</span>
          </div>
          <p><strong>Date Caught:</strong> {fishInfo.dateCaught}</p>
          <p><strong>Description:</strong> {fishInfo.description}</p>
          <p><strong>Location:</strong> {fishInfo.location}</p>
          <p><strong>Fish Story:</strong> {fishInfo.fishStory}</p>
        </div>
      )}
    </div>
  );
};

export default FishIdentifier;