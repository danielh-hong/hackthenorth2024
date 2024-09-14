import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaChevronDown, FaChevronUp, FaFish } from 'react-icons/fa';
import styles from './RecentCatchesPanel.module.css';

const RecentCatchesPanel = ({ onCatchSelect }) => {
  const [recentCatches, setRecentCatches] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentCatches();
  }, []);

  const fetchRecentCatches = async () => {
    try {
      const response = await fetch('http://localhost:3001/recent-fish-catches');
      if (!response.ok) throw new Error('Failed to fetch recent catches');
      const data = await response.json();
      setRecentCatches(data);
    } catch (error) {
      console.error('Error fetching recent catches:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.panel} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header} onClick={togglePanel}>
        <h2>Recent Catches</h2>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      <div className={styles.content}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className={styles.catchList}>
            {recentCatches.map((fishCatch) => (
              <li key={fishCatch._id} className={styles.catchItem} onClick={() => onCatchSelect(fishCatch)}>
                <FaFish className={styles.fishIcon} style={{ color: getFishColor(fishCatch.rarityScore) }} />
                <div className={styles.catchInfo}>
                  <h3>{fishCatch.fishName}</h3>
                  <p>{format(new Date(fishCatch.dateCaught), 'MMM dd, yyyy HH:mm')}</p>
                  <p>Rarity: {fishCatch.rarityScore}/10</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const getFishColor = (rarityScore) => {
  const hue = 200 - (rarityScore * 20); // Blue (200) to Red (0)
  return `hsl(${hue}, 100%, 50%)`;
};

export default RecentCatchesPanel;