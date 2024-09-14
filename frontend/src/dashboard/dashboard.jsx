import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FishIdentifier from './FishIdentifier';
import { UserContext } from '../UserContext'; // Adjust the import path as needed

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Or you could return a loading spinner here
  }

  return (
    <div>
      <FishIdentifier />
    </div>
  );
};

export default Dashboard;