/* database.js */

const mongoose = require('mongoose');

// Fish Catch Schema
const fishCatchSchema = new mongoose.Schema({
  fishName: {
    type: String,
    required: true
  },
  rarityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  dateCaught: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  fishStory: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0,
    required: true
  },
  length: {
    type: Number,
    min: 0,
    required: true
  },
  caughtBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fishCatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FishCatch'
  }]
});

const User = mongoose.model('User', userSchema);
const FishCatch = mongoose.model('FishCatch', fishCatchSchema);

module.exports = { User, FishCatch };
