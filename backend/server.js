import express from "express";
import cors from "cors";
// import records from "./routes/record.js";

const cohere = require('cohere-ai');
cohere.init(process.env.COHERE_API_KEY);

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
// app.use("/record", records);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

var STORY_LENGTH = 300;

// Set up an endpoint for text generation
app.post('/generate-story', async (req, res) => {
  const { fishType, location } = req.body;
  
  try {
    const response = await cohere.generate({
      model: 'command',
      prompt: `Write a funny short story about catching a ${fishType} in ${location}. Be sure to keep the tone ${mood}`,
      max_tokens: STORY_LENGTH,
      temperature: 0.8,
    });
    
    res.json({ story: response.body.generations[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Error generating story' });
  }
});

// Set up an endpoint for text classification
app.post('/classify-story', async (req, res) => {
  const { story } = req.body;
  
  try {
    const response = await cohere.classify({
      model: 'large',
      inputs: [story],
      examples: [
        { text: "I caught a tiny fish that turned out to be a submarine!", label: "funny" },
        { text: "The rare blue-finned tuna is only found in these waters.", label: "educational" },
        { text: "I reeled in a fish bigger than my boat!", label: "rare catch" }
      ]
    });
    
    res.json({ classification: response.body.classifications[0].prediction });
  } catch (error) {
    res.status(500).json({ error: 'Error classifying story' });
  }
});