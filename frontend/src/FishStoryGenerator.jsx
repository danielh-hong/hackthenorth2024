import React, { useState } from 'react';
import axios from 'axios';

function FishStoryGenerator() {
  const [fishType, setFishType] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [classification, setClassification] = useState('');

  const generateStory = async () => {
    try {
      const response = await axios.post('/generate-story', { fishType, location });
      setStory(response.data.story);
      console.log("Story post sent out");
      // Classify the generated story
      const classResponse = await axios.post('/classify-story', { story: response.data.story });
      setClassification(classResponse.data.classification);
    } catch (error) {
      console.error('Error generating story:', error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={fishType} 
        onChange={(e) => setFishType(e.target.value)} 
        placeholder="Fish type"
      />
      <input 
        type="text" 
        value={location} 
        onChange={(e) => setLocation(e.target.value)} 
        placeholder="Location"
      />
      <button onClick={generateStory}>Generate Story</button>
      {story && (
        <div>
          <h3>Generated Story:</h3>
          <p>{story}</p>
          <p>Classification: {classification}</p>
        </div>
      )}
    </div>
  );
}

export default FishStoryGenerator;
