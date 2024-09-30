import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SharedFishCatch = () => {
  const { id } = useParams();
  const [fishCatch, setFishCatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFishCatch = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid fish ID');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/shared-fish/${id}`);
        setFishCatch(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared fish catch:', err);
        setError('Failed to load fish data');
        setLoading(false);
      }
    };

    fetchFishCatch();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!fishCatch) return <div>No fish data found</div>;

  return (
    <div>
      <h1>{fishCatch.fishName}</h1>
      <p>Caught by: {fishCatch.caughtBy?.username || 'Unknown'}</p>
      <p>Rarity: {fishCatch.rarityScore}/10</p>
      <p>Weight: {fishCatch.weight}g</p>
      <p>Length: {fishCatch.length}cm</p>
      <p>Description: {fishCatch.description}</p>
      <p>Fish Tale: {fishCatch.fishStory}</p>
    </div>
  );
};

export default SharedFishCatch;