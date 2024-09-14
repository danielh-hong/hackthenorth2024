const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./database'); // Make sure this path is correct
// Create a new directory synchronously
const newFolderPath = path.join(__dirname, 'uploads');

try {
  fs.mkdirSync(newFolderPath, { recursive: true });
  console.log('Folder created successfully');
} catch (err) {
  console.error('Error creating folder:', err);
}

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully', username });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    res.json({ message: 'Logged in successfully', username });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

app.post('/identify-fish', upload.single('image'), async (req, res) => {
  console.log('Received request body:', req.body);

  if (!req.file) {
    console.log("ERROR 400: NO IMAGE FILE UPLOADED");
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const { username, latitude, longitude } = req.body;
  if (!username || latitude === undefined || longitude === undefined) {
    console.log("ERROR 400: USERNAME AND LOCATION REQD");
    return res.status(400).json({ error: 'Username and location are required' });
  }


  // Validate latitude and longitude
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  console.log('Parsed latitude and longitude:', { lat, lon });

  if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
    console.log("INVALID LATITUDE/LONGITUDE");
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  const filePath = path.resolve(req.file.path);

  try {
    const imagePart = fileToGenerativePart(filePath, req.file.mimetype);

    const prompt = `
      Analyze this image of a fish and provide the following information:
      1. Fish Name: Identify the species of the fish.
      2. Rarity Score: Rate the rarity of the fish on a scale from 1 to 10, where 1 is very common and 10 is extremely rare.
      3. Description: Provide a brief description of the fish.
      4. Location: Suggest a typical location where this fish might be found.
      5. Fish Story: Create a short, interesting story about catching this fish.
    `;

    const jsonSchema = {
      type: "object",
      properties: {
        fishName: { type: "string" },
        rarityScore: { type: "number" },
        description: { type: "string" },
        location: { type: "string" },
        fishStory: { type: "string" }
      },
      required: ["fishName", "rarityScore", "description", "location", "fishStory"]
    };

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [imagePart] }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        topP: 1,
        topK: 32,
        responseMimeType: 'application/json',
        responseSchema: jsonSchema
      }
    });

    const response = await result.response;
    const fishInfo = JSON.parse(await response.text());

    console.log('AI generated fish info:', fishInfo);

    try {
      console.log("ENTERING TRY / CATCH BLOCK");
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if this type of fish has been caught before
      const existingFishCatchIndex = user.fishCatches.findIndex(fishCatch => fishCatch.fishName === fishInfo.fishName);
      if (existingFishCatchIndex !== -1) {
        user.fishCatches[existingFishCatchIndex].timesCaught += 1;
      } else {
        user.fishCatches.push({
          ...fishInfo,
          dateCaught: new Date(),
          timesCaught: 1
        });
      }
      // Create a new FishCatch document
      const newFishCatch = new FishCatch({
        ...fishInfo,
        caughtBy: user._id,
        dateCaught: new Date(),
        latitude: lat,
        longitude: lon
      });

      console.log('New fish catch object:', newFishCatch);

      // Save the new fish catch
      await newFishCatch.save();

      // Initialize fishCatches array if it doesn't exist
      if (!user.fishCatches) {
        user.fishCatches = [];
      }


      // Add the reference to the user's fishCatches array
      user.fishCatches.push(newFishCatch._id);
      await user.save();

      res.json(fishInfo);
      res.json({
        ...fishInfo,
        latitude: lat,
        longitude: lon
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'An error occurred while updating the database.', details: dbError.message });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'An error occurred while processing the image.' });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
  }
});

app.get('/get-all-fish-catches', async (req, res) => {
  try {
    // Fetch all fish catches from the database
    const fishCatches = await FishCatch.find({}).populate('caughtBy', 'username');

    // Transform the data to include the username and format the location
    const formattedFishCatches = fishCatches.map(fishCatch => ({
      ...fishCatch.toObject(),
      username: fishCatch.caughtBy.username,
      location: `${fishCatch.latitude},${fishCatch.longitude}`,
      caughtBy: undefined // Remove the caughtBy field to avoid sending unnecessary data
    }));

    res.json(formattedFishCatches);
  } catch (error) {
    console.error('Error fetching fish catches:', error);
    res.status(500).json({ error: 'An error occurred while fetching fish catches' });
  }
});



app.get('/recent-fish-catches', async (req, res) => {
  try {
    const recentCatches = await FishCatch.find()
      .sort({ dateCaught: -1 }) // Sort by date, most recent first
      .limit(10) // Limit to 10 most recent catches
      .populate('caughtBy', 'username') // Populate the user who caught the fish
      .select('-__v'); // Exclude the version key

    res.json(recentCatches);
  } catch (error) {
    console.error('Error fetching recent catches:', error);
    res.status(500).json({ message: 'Error fetching recent catches' });
  }
});




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});