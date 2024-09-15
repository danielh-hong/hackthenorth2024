import React from 'react';
import { MdClose } from 'react-icons/md';
import styles from './FishResultsModal.module.css';

const FishResultsModal = ({ fishInfo, image, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>You've discovered a {fishInfo.fishName}!</h2>
        <div className={styles.fishImageContainer}>
          <img src={URL.createObjectURL(image)} alt={fishInfo.fishName} className={styles.fishImage} />
        </div>
        <p className={styles.fishJoke}>{fishInfo.joke}</p>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Rarity:</span>
          <span className={styles.statValue}>{fishInfo.rarityScore}/10</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{width: `${fishInfo.rarityScore * 10}%`}}></div>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Weight:</span>
          <span className={styles.statValue}>{fishInfo.weight} grams</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Length:</span>
          <span className={styles.statValue}>{fishInfo.length} cm</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Date Caught:</span>
          <span className={styles.statValue}>{fishInfo.dateCaught}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Location:</span>
          <span className={styles.statValue}>{fishInfo.location}</span>
        </div>
        <div className={styles.fishDescription}>
          <h3>Description</h3>
          <p>{fishInfo.description}</p>
        </div>
        <div className={styles.fishStory}>
          <h3>Fish Story</h3>
          <p>{fishInfo.fishStory}</p>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          <MdClose />
        </button>
      </div>
    </div>
  );
};

export default FishResultsModal;