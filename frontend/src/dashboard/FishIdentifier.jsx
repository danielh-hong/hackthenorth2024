import React, { useState, useRef, useEffect, useContext } from 'react';
import { MdImage, MdCamera, MdFileUpload, MdAutorenew, MdAnalytics, MdAddAPhoto, MdClose, MdZoomIn, MdZoomOut } from 'react-icons/md';
import { FaFish } from 'react-icons/fa';
import FishResultsModal from './FishResultsModal';
import FishUnlockedNotification from './FishUnlockedNotification';
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
  const [showUnlockedNotification, setShowUnlockedNotification] = useState(false);
  const [location, setLocation] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const { user } = useContext(UserContext);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageRef = useRef(null);


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

  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleImageClick = (e) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      imageRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % attachedImages.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + attachedImages.length) % attachedImages.length);
    setZoomLevel(1);
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

      // Show the unlocked notification
      setShowUnlockedNotification(true);

      // Automatically transition to fish info after 3 seconds
      setTimeout(() => {
        setShowUnlockedNotification(false);
        setIsResultsModalOpen(true);
      }, 4000);

    } catch (error) {
      console.error('Error analyzing fish:', error);
      alert(error.message || 'Failed to analyze fish. Please try again.');
    } finally {
      setIsLoading(false);
      setAttachedImages([]);
    }
  };

  const resetCapture = () => {
    setImage(null);
    setFishInfo(null);
    setIsResultsModalOpen(false);
    setAttachedImages([]);
  };

  const generateFishJoke = (fishName) => {
    const jokes = [
      `Why was the ${fishName} bad at basketball? It was always getting caught in the net!`,
      `What do you call a ${fishName} wearing a bowtie? So-fish-ticated!`,
      `How does a ${fishName} go to war? In a tank!`,
      `Why don't ${fishName}s play soccer? They're afraid of the net!`,
      `What do you call a ${fishName} with no eyes? Fsh!`,
      `How did the ${fishName} find out it was in trouble? It was on the hook!`,
      `How did the ${fishName} get rich? Phishing!`,
      `Where do ${fishName}s get their energy from? Nuclear fishion!`,
      `Where do ${fishName}s store their money? In the river bank!`,
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
            <button 
              onClick={() => setIsCameraModalOpen(false)} 
              className={styles.closeButton}
              aria-label="Close camera modal"
            >
              <MdClose />
            </button>
            <div className={styles.cameraPreview}>
              <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
              <div className={styles.cameraOverlay}>
                <FaFish className={styles.overlayIcon} />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={captureImage} className={styles.captureButton}>Capture Fish</button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />

      {showUnlockedNotification && (
        <FishUnlockedNotification
          onComplete={() => setShowUnlockedNotification(false)}
        />
      )}

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
          <div className={styles.imageViewerContainer}>
            <img 
              ref={imageRef}
              src={URL.createObjectURL(attachedImages[currentImageIndex])}
              alt={`Attached image ${currentImageIndex + 1}`}
              className={styles.attachedImage}
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={handleImageClick}
            />
            <div className={styles.imageControls}>
              <button onClick={prevImage} className={styles.imageNavButton}>Previous</button>
              <button onClick={handleZoomOut} className={styles.zoomButton}><MdZoomOut /></button>
              <button onClick={handleZoomIn} className={styles.zoomButton}><MdZoomIn /></button>
              <button onClick={nextImage} className={styles.imageNavButton}>Next</button>
            </div>
            <p className={styles.imageCounter}>
              Image {currentImageIndex + 1} of {attachedImages.length}
            </p>
          </div>
          <button 
            onClick={() => {
              setIsAttachedImagesModalOpen(false);
              setZoomLevel(1);
            }} 
            className={styles.closeButton}
          >
            <MdClose />
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default FishIdentifier;