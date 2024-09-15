import React from 'react';
import { MdClose } from 'react-icons/md';
import styles from './FishModal.module.css';

const FishModal = ({ fish, onClose }) => {
  if (!fish) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          <MdClose />
        </button>
        <h2 className={styles.fishName}>{fish.fishName}</h2>
        <div className={styles.fishInfo}>
          <p><strong>Rarity Score:</strong> <span className={styles.rarityScore}>{fish.rarityScore}</span></p>
          <p><strong>Weight:</strong> {fish.weight}g</p>
          <p><strong>Length:</strong> {fish.length}cm</p>
          <p><strong>Date Caught:</strong> {new Date(fish.dateCaught).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {fish.latitude.toFixed(4)}, {fish.longitude.toFixed(4)}</p>
          <p><strong>Caught By:</strong> {fish.username}</p>
        </div>
        <div className={styles.fishDescription}>
          <h3>Description</h3>
          <p>{fish.description}</p>
        </div>
        <div className={styles.fishStory}>
          <h3>Fish Tale:</h3>
          <p>{fish.fishStory}</p>
        </div>
      </div>
    </div>
  );
};

export default FishModal;