const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const upload = multer({ dest: 'uploads/' });

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

  const filePath = path.resolve(req.file.path);

  try {
    const imagePart = fileToGenerativePart(filePath, req.file.mimetype);

    const prompt = `
      Analyze this image of a fish and provide the following information:
      1. Fish Name: Identify the species of the fish.
      2. Rarity: Rate the rarity of the fish on a scale from 1 to 10, where 1 is very common and 10 is extremely rare.
      3. Score: Calculate a score from 0 to 100 based on factors such as size, coloration, and unique features.
      4. Habitat: Describe the typical habitat or place where this fish is commonly found.

      Format your response as a JSON object with keys: fishName, rarity, score, and habitat.
    `;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [imagePart] }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        topP: 1,
        topK: 32,
      }
    });

    const response = await result.response;
    const text = await response.text();
    
    let fishInfo;
    try {
      fishInfo = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({ error: 'Failed to parse fish information' });
    }

    res.json(fishInfo);
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