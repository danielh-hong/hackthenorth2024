import React, { useState, useRef, useEffect, useContext } from 'react';
import { MdImage, MdCamera, MdFileUpload, MdAutorenew, MdAnalytics, MdAddAPhoto, MdClose } from 'react-icons/md';
import { FaFish } from 'react-icons/fa';
import FishResultsModal from './FishResultsModal';
import { UserContext } from '../UserContext';
import styles from './FishIdentifier.module.css';

const FishIdentifier = () => {
  const [image, setImage] = useState(null);
  const [attachedImages, setAttachedImages] = useState([]);
  const [fishInfo, setFishInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isAttachedImagesModalOpen, setIsAttachedImagesModalOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (isCameraModalOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraModalOpen]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

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
        setAttachedImages(prev => [...prev, blob]);
        setIsCameraModalOpen(false);
      }, 'image/jpeg');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setAttachedImages(prev => [...prev, file]);
    }
  };


  const analyzeFish = async () => {
    if (!image || !user || !location) {
      alert('Missing image, user, or location data. Please try again.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', image, 'fish.jpg');
    formData.append('username', user.username);
    formData.append('latitude', location.latitude.toFixed(6));
    formData.append('longitude', location.longitude.toFixed(6));

    try {
      const response = await fetch('http://localhost:3001/identify-fish', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze fish');
      }

      const data = await response.json();
      setFishInfo({
        ...data,
        dateCaught: new Date().toLocaleString(),
        joke: generateFishJoke(data.fishName)
      });
      setIsResultsModalOpen(true);
    } catch (error) {
      console.error('Error analyzing fish:', error);
      alert(error.message || 'Failed to analyze fish. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const resetCapture = () => {
    setImage(null);
    setFishInfo(null);
    setIsResultsModalOpen(false);
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

      
      <div className={styles.captureContainer}>

        <div className={styles.actionButtons}>
          <button onClick={() => setIsCameraModalOpen(true)} className={`${styles.actionButton} ${styles.cameraButton}`}>
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
          {image && location && (
            <>
              <button onClick={analyzeFish} className={`${styles.actionButton} ${styles.analyzeButton}`} disabled={isLoading}>
                <MdAnalytics /> {isLoading ? 'Analyzing...' : 'Identify Fish'}
              </button>
              <button onClick={resetCapture} className={`${styles.actionButton} ${styles.resetButton}`}>
                <MdAutorenew /> Start Over
              </button>
            </>
          )}

          {attachedImages.length > 0 && (
            <button 
              onClick={() => setIsAttachedImagesModalOpen(true)} 
              className={styles.viewAttachedButton}
            >
              <MdImage /> View Attached Images ({attachedImages.length})
            </button>
          )}
        </div>
      </div>


      {isCameraModalOpen && (
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
              <button onClick={() => setIsCameraModalOpen(false)} className={styles.closeButton}>Close</button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />

      {isResultsModalOpen && fishInfo && (
        <FishResultsModal
          fishInfo={fishInfo}
          image={image}
          onClose={() => setIsResultsModalOpen(false)}
        />
      )}

      {isAttachedImagesModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Attached Images</h2>
            <div className={styles.attachedImagesGrid}>
              {attachedImages.map((img, index) => (
                <img 
                  key={index} 
                  src={URL.createObjectURL(img)} 
                  alt={`Attached image ${index + 1}`} 
                  className={styles.attachedImage}
                />
              ))}
            </div>
            <button onClick={() => setIsAttachedImagesModalOpen(false)} className={styles.closeButton}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FishIdentifier;