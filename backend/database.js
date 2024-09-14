const mongoose = require('mongoose');

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
    timesCaught: {
      type: Number,
      default: 1
    },
    location: {
      type: String,
      trim: true
    },
    fishStory: {
      type: String,
      trim: true
    }
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = { User };