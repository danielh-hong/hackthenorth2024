const fs = require('fs');
const path = require('path');
const { FishCatch, User } = require('./database');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Fake Data User ID
const FAKE_DATA_USER_ID = "66e65f29a1d4d3576fc08d8e";

// Great Lakes coordinates (highly specific)
const greatLakes = [
  { 
    name: 'Superior', 
    coordinates: [
      { lat: 46.603354, lon: -84.777832 }, // Eastern point
      { lat: 46.752079, lon: -92.098389 }, // Western point
      { lat: 48.983307, lon: -88.369141 }, // Northern point
      { lat: 46.452995, lon: -86.566162 }, // Southern point
    ]
  },
  { 
    name: 'Michigan', 
    coordinates: [
      { lat: 45.798170, lon: -86.099854 }, // Northern point
      { lat: 41.762123, lon: -86.826782 }, // Southern point
      { lat: 43.118668, lon: -87.901001 }, // Western point
      { lat: 45.058001, lon: -85.608520 }, // Eastern point
    ]
  },
  { 
    name: 'Huron', 
    coordinates: [
      { lat: 45.989246, lon: -84.373779 }, // Northern point
      { lat: 43.006966, lon: -82.419434 }, // Southern point
      { lat: 44.768398, lon: -80.227051 }, // Eastern point
      { lat: 43.755424, lon: -84.613037 }, // Western point
    ]
  },
  { 
    name: 'Erie', 
    coordinates: [
      { lat: 42.266224, lon: -81.251831 }, // Northern point
      { lat: 42.684154, lon: -79.063721 }, // Eastern point
      { lat: 41.382340, lon: -82.671509 }, // Southern point
      { lat: 41.760576, lon: -83.454590 }, // Western point
    ]
  },
  { 
    name: 'Ontario', 
    coordinates: [
      { lat: 43.949317, lon: -76.791992 }, // Northern point
      { lat: 43.263013, lon: -79.047241 }, // Western point
      { lat: 43.620030, lon: -76.524658 }, // Eastern point
      { lat: 43.250711, lon: -77.808228 }, // Southern point
    ]
  },
];

// Fish types with all required fields
const fishTypes = [
  { name: 'Lake Trout', rarityRange: [3, 6], weightRange: [1000, 6000], lengthRange: [40, 100] },
  { name: 'Walleye', rarityRange: [2, 5], weightRange: [500, 3000], lengthRange: [30, 70] },
  { name: 'Yellow Perch', rarityRange: [1, 3], weightRange: [100, 500], lengthRange: [15, 30] },
  { name: 'Smallmouth Bass', rarityRange: [2, 4], weightRange: [500, 2500], lengthRange: [25, 50] },
  { name: 'Largemouth Bass', rarityRange: [2, 4], weightRange: [500, 3000], lengthRange: [30, 60] },
  { name: 'Northern Pike', rarityRange: [3, 6], weightRange: [1000, 7000], lengthRange: [50, 120] },
  { name: 'Muskellunge', rarityRange: [6, 9], weightRange: [3000, 15000], lengthRange: [80, 150] },
  { name: 'Brook Trout', rarityRange: [4, 7], weightRange: [200, 1500], lengthRange: [20, 40] },
  { name: 'Rainbow Trout', rarityRange: [3, 6], weightRange: [500, 3000], lengthRange: [30, 70] },
  { name: 'Chinook Salmon', rarityRange: [5, 8], weightRange: [2000, 10000], lengthRange: [60, 120] },
  { name: 'Coho Salmon', rarityRange: [4, 7], weightRange: [1000, 5000], lengthRange: [50, 90] },
  { name: 'Lake Whitefish', rarityRange: [2, 5], weightRange: [500, 3000], lengthRange: [40, 70] },
  { name: 'Burbot', rarityRange: [5, 8], weightRange: [1000, 4000], lengthRange: [40, 80] },
  { name: 'Lake Sturgeon', rarityRange: [8, 10], weightRange: [5000, 50000], lengthRange: [100, 200] },
  { name: 'Channel Catfish', rarityRange: [3, 6], weightRange: [1000, 5000], lengthRange: [40, 90] },
  { name: 'Freshwater Drum', rarityRange: [2, 4], weightRange: [500, 3000], lengthRange: [30, 60] },
  { name: 'Rock Bass', rarityRange: [1, 3], weightRange: [100, 500], lengthRange: [15, 30] },
  { name: 'White Bass', rarityRange: [2, 4], weightRange: [200, 1000], lengthRange: [20, 40] },
  { name: 'Pumpkinseed', rarityRange: [1, 2], weightRange: [50, 200], lengthRange: [10, 20] },
  { name: 'Bluegill', rarityRange: [1, 2], weightRange: [50, 250], lengthRange: [10, 25] },
];

// Helper functions
const randomInRange = (min, max) => Math.random() * (max - min) + min;
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

const generateFishCatch = (lake, fishType) => {
  const point1 = randomElement(lake.coordinates);
  const point2 = randomElement(lake.coordinates);
  const lat = randomInRange(Math.min(point1.lat, point2.lat), Math.max(point1.lat, point2.lat));
  const lon = randomInRange(Math.min(point1.lon, point2.lon), Math.max(point1.lon, point2.lon));
  const rarity = Math.round(randomInRange(fishType.rarityRange[0], fishType.rarityRange[1]));
  const weight = Math.round(randomInRange(fishType.weightRange[0], fishType.weightRange[1]));
  const length = Math.round(randomInRange(fishType.lengthRange[0], fishType.lengthRange[1]));

  return new FishCatch({
    fishName: fishType.name,
    rarityScore: rarity,
    dateCaught: new Date(randomInRange(new Date(2023, 0, 1).getTime(), new Date().getTime())),
    description: `A beautiful ${fishType.name} caught in Lake ${lake.name}.`,
    latitude: lat,
    longitude: lon,
    fishStory: `On a ${['sunny', 'cloudy', 'misty', 'breezy'][Math.floor(Math.random() * 4)]} day, an angler reeled in this impressive ${fishType.name} after a ${['quick', 'lengthy', 'challenging'][Math.floor(Math.random() * 3)]} battle.`,
    weight: weight,
    length: length,
    caughtBy: FAKE_DATA_USER_ID
  });
};

const generateFishSpots = async (numSpots) => {
  const fishCatches = [];

  for (let i = 0; i < numSpots; i++) {
    const lake = randomElement(greatLakes);
    const fishType = randomElement(fishTypes);
    const fishCatch = generateFishCatch(lake, fishType);
    fishCatches.push(fishCatch);
  }

  try {
    const insertedCatches = await FishCatch.insertMany(fishCatches);
    console.log(`Successfully inserted ${numSpots} fish catches.`);

    // Update the user's fishCatches array
    await User.findByIdAndUpdate(
      FAKE_DATA_USER_ID,
      { $push: { fishCatches: { $each: insertedCatches.map(fishCatch => fishCatch._id) } } },
      { new: true }
    );
    console.log(`Updated user's fishCatches array.`);

  } catch (error) {
    console.error('Error inserting fish catches:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Generate 10 fish spots
generateFishSpots(100);
