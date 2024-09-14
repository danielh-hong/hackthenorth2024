import React, { useState, useRef, useEffect, useContext } from 'react';
import { MdCamera, MdFileUpload, MdAutorenew, MdAnalytics, MdAddAPhoto } from 'react-icons/md';
import { FaFish, FaWater } from 'react-icons/fa';

import { UserContext } from '../UserContext'; // Adjust the import path as needed
import styles from './FishIdentifier.module.css';

const FishIdentifier = () => {
  const [image, setImage] = useState(null);
  const [fishInfo, setFishInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const { user } = useContext(UserContext);


  useEffect(() => {
    if (isModalOpen) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isModalOpen]);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        setImage(blob);
        setIsModalOpen(false);
      }, 'image/jpeg');
    }
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
        joke: generateFishJoke(data.fishName),
        weight: data.weight, // Add this line
        length: data.length  // Add this line
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
    return <div className={styles.loginPrompt}>Please log in to use AquaScan</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FaFish className={styles.headerIcon} />
        <h1 className={styles.title}>AquaScan</h1>
      </div>
      <p className={styles.description}>
        Dive into the world of fish identification! Capture or upload an image, and let our AI be your underwater guide.
        Discover species, rarity, and fun facts about your aquatic finds!
      </p>
      
      <div className={styles.captureContainer}>
        <div className={styles.imagePreviewArea}>
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Captured fish" className={styles.capturedImage} />
          ) : (
            <div className={styles.placeholderContent}>
              <MdAddAPhoto className={styles.placeholderIcon} />
              <p>Your aquatic discovery awaits!</p>
            </div>
          )}
          <div className={styles.waterOverlay}>
            <FaWater className={styles.waterIcon} />
            <FaWater className={styles.waterIcon} />
            <FaWater className={styles.waterIcon} />
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button onClick={() => setIsModalOpen(true)} className={`${styles.actionButton} ${styles.cameraButton}`}>
            <MdCamera /> Capture Fish
          </button>
          <button onClick={() => fileInputRef.current.click()} className={`${styles.actionButton} ${styles.uploadButton}`}>
            <MdFileUpload /> Upload Fish Photo
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
              <button onClick={analyzeFish} className={`${styles.actionButton} ${styles.analyzeButton}`} disabled={isLoading}>
                <MdAnalytics /> {isLoading ? 'Analyzing...' : 'Identify Fish'}
              </button>
              <button onClick={resetCapture} className={`${styles.actionButton} ${styles.resetButton}`}>
                <MdAutorenew /> Start Over
              </button>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.cameraPreview}>
              <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
              <div className={styles.cameraOverlay}>
                <FaFish className={styles.overlayIcon} />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={captureImage} className={styles.captureButton}>Capture Fish</button>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>Close</button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />

      {fishInfo && (
        <div className={styles.fishInfoCard}>
          <h2>You've discovered a {fishInfo.fishName}!</h2>
          <div className={styles.fishImageContainer}>
            <img src={URL.createObjectURL(image)} alt={fishInfo.fishName} className={styles.fishImage} />
          </div>
          <p className={styles.fishJoke}>{fishInfo.joke}</p>
          <div className={styles.infoRow}>
            <span>Rarity:</span>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{width: `${fishInfo.rarityScore * 10}%`}}></div>
            </div>
            <span>{fishInfo.rarityScore}/10</span>
          </div>
          <p><strong>Weight:</strong> {fishInfo.weight} grams</p>
          <p><strong>Length:</strong> {fishInfo.length} cm</p>
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
