import React from 'react';
import { MdClose, MdScale, MdStraighten, MdDateRange, MdLocationOn, MdPerson, MdStars } from 'react-icons/md';
import styles from './FishModal.module.css';

const FishModal = ({ fish, onClose }) => {
  if (!fish) return null;

  const InfoItem = ({ icon, label, value }) => (
    <div className={styles.infoItem}>
      <div className={styles.infoLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.infoValue}>{value}</div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          <MdClose />
        </button>
        <h2 className={styles.fishName}>{fish.fishName}</h2>
        <div className={styles.fishInfo}>
          <InfoItem icon={<MdStars />} label="Rarity Score" value={<span className={styles.rarityScore}>{fish.rarityScore}</span>} />
          <InfoItem icon={<MdScale />} label="Weight" value={`${fish.weight}g`} />
          <InfoItem icon={<MdStraighten />} label="Length" value={`${fish.length}cm`} />
          <InfoItem icon={<MdDateRange />} label="Date Caught" value={new Date(fish.dateCaught).toLocaleDateString()} />
          <InfoItem icon={<MdLocationOn />} label="Location" value={`${fish.latitude.toFixed(4)}, ${fish.longitude.toFixed(4)}`} />
          <InfoItem icon={<MdPerson />} label="Caught By" value={fish.username} />
        </div>
        <div className={styles.fishDescription}>
          <h3>Description</h3>
          <p>{fish.description}</p>
        </div>
        <div className={styles.fishStory}>
          <h3>Fish Tale</h3>
          <p>{fish.fishStory}</p>
        </div>
      </div>
    </div>
  );
};

export default FishModal;
