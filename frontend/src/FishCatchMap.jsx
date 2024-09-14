import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from './ColorTheme';
import { UserContext } from './UserContext';
import styles from './FishCatchMap.module.css';

const getColorByFishName = (fishName) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
    '#F67280', '#C06C84', '#6C5B7B', '#355C7D', '#F8B195'
  ];
  const hash = fishName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const createFishIcon = (color) => {
  return L.divIcon({
    className: styles.fishIcon,
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.42-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="${color}"/>
        <path d="M12 8.5c1 0 2-.5 2-1s-1-2-2-2-2 1.5-2 2 1 1 2 1z" fill="white"/>
      </svg>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const FishCatchMap = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [fishCatches, setFishCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([43.6532, -79.3832]); // Default to Toronto
  const [mapZoom, setMapZoom] = useState(10);
  const [selectedCatch, setSelectedCatch] = useState(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (user) {
      fetchFishCatches();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchFishCatches = async () => {
    try {
      const response = await fetch('http://localhost:3001/get-all-fish-catches', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fish catches');
      }
      const data = await response.json();
      setFishCatches(data);
      // Set map center to the first catch location if available
      if (data.length > 0) {
        const [lat, lng] = data[0].location.split(',').map(Number);
        setMapCenter([lat, lng]);
      }
    } catch (error) {
      console.error('Error fetching fish catches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomToCatch = (fishCatch) => {
    const [lat, lng] = fishCatch.location.split(',').map(Number);
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setSelectedCatch(fishCatch);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.mapWrapper}>
      <MapContainer center={mapCenter} zoom={mapZoom} className={styles.mapContainer}>
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {fishCatches.map((fishCatch, index) => {
          const [lat, lng] = fishCatch.location.split(',').map(Number);
          const color = getColorByFishName(fishCatch.fishName);
          const icon = createFishIcon(color);

          return (
            <Marker key={index} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className={styles.popupContent}>
                  <p><strong>Fish:</strong> {fishCatch.fishName}</p>
                  <p><strong>Rarity Score:</strong> {fishCatch.rarityScore}/10</p>
                  <p><strong>Weight:</strong> {fishCatch.weight} grams</p>
                  <p><strong>Length:</strong> {fishCatch.length} cm</p>
                  <p><strong>Date Caught:</strong> {moment(fishCatch.dateCaught).format('YYYY-MM-DD HH:mm:ss')}</p>
                  <p><strong>Description:</strong> {fishCatch.description}</p>
                  <p><strong>Times Caught:</strong> {fishCatch.timesCaught}</p>
                  <p><strong>Fish Story:</strong> {fishCatch.fishStory}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FishCatchMap;