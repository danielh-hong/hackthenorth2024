import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFish, FaTrophy, FaRuler, FaCalendarAlt, FaWater, FaSun, FaSearch } from 'react-icons/fa';
import styles from './Achievements.module.css';

const achievements = [
  { date: '2023-05-15', title: 'First Catch', icon: <FaFish />, description: 'A beautiful 5-inch Bluegill', color: '#4299e1' },
  { date: '2023-06-02', title: 'Double Digits', icon: <FaRuler />, description: 'Reeled in a 10.5-inch Bass', color: '#48bb78' },
  { date: '2023-07-20', title: 'Tropical Delight', icon: <FaSun />, description: 'First tropical fish: Clownfish', color: '#ed8936' },
  { date: '2023-08-10', title: 'The Big One', icon: <FaTrophy />, description: 'Landed a mighty 24-inch Pike', color: '#ecc94b' },
  { date: '2023-09-05', title: 'Sunrise to Sunset', icon: <FaCalendarAlt />, description: 'A full day of fishing adventures', color: '#9f7aea' },
  { date: '2023-10-18', title: 'Ocean Explorer', icon: <FaWater />, description: 'Caught a majestic Marlin at sea', color: '#4fd1c5' },
];

const FishAchievements = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Fishing Journey
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Celebrating the joy of every catch, big and small!
        </motion.p>

        <motion.div 
          className={styles.searchContainer}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </motion.div>

        <AnimatePresence>
          <motion.div className={styles.achievementsGrid} layout>
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                className={styles.achievementCard}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                layout
              >
                <div className={styles.achievementIcon} style={{ backgroundColor: achievement.color }}>
                  {achievement.icon}
                </div>
                <h2 className={styles.achievementTitle}>{achievement.title}</h2>
                <p className={styles.achievementDate}>{achievement.date}</p>
                <p className={styles.achievementDescription}>{achievement.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div 
          className={styles.footer}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p>Every fish has a story. Here's to many more adventures!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default FishAchievements;