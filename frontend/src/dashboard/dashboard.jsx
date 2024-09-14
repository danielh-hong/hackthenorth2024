import React from 'react';
import { MdWavingHand, MdWaterDrop, MdShowChart } from 'react-icons/md';
import { FaFish } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const fishData = [
  { name: 'Salmon', count: 150 },
  { name: 'Tuna', count: 300 },
  { name: 'Cod', count: 200 },
  { name: 'Trout', count: 100 },
  { name: 'Bass', count: 250 },
];

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      
      <div className={styles.content}>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <FaFish className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Total Fish</h3>
              <p>1,000</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <MdWaterDrop className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Water Quality</h3>
              <p>Excellent</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <MdShowChart className={styles.statIcon} />
            <div className={styles.statInfo}>
              <h3>Growth Rate</h3>
              <p>+5.2%</p>
            </div>
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <h2>Fish Population</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fishData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className={styles.recentActivity}>
          <h2>Recent Activity</h2>
          <ul>
            <li>New school of salmon added</li>
            <li>Water filter maintenance performed</li>
            <li>Feeding schedule updated</li>
            <li>Monthly fish count completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;