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
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
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

    try {
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

      await user.save();

      res.json(fishInfo);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'An error occurred while updating the database.' });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});