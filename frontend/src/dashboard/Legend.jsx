import React from 'react';
import styles from './Legend.module.css';

const Legend = ({ fishCatches, onFishClick }) => {
  return (
    <div className={styles.legend}>
      <h3>Fish Legend</h3>
      <ul>
        {fishCatches.map((fish, index) => (
          <li key={fish._id} onClick={() => onFishClick(fish)}>
            <span className={styles.number}>{index + 1}</span>
            <span className={styles.fishName}>{fish.fishName}</span>
            <span className={styles.rarityScore}>Rarity: {fish.rarityScore}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;