const Mood = require('../models/moodModel');
const mongoose = require('mongoose');

// Get all moods
const getMoods = async (req, res) => {
  try {
    const moods = await Mood.find({}).sort({ createdAt: -1 });
    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve moods' });
  }
};

// Get a single mood
const getMood = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such mood' });
  }

  try {
    const mood = await Mood.findById(id);
    if (!mood) {
      return res.status(404).json({ error: 'No such mood' });
    }

    res.status(200).json(mood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve mood' });
  }
};

// Create a new mood
const createMood = async (req, res) => {
  const { rating, emotions, hoursSlept, note, date } = req.body; // Make sure to destructure 'emotions'

  // Validate required fields
  if (rating == null || !Array.isArray(emotions)) {
    return res.status(400).json({ error: 'Rating and emotions are required' });
  }

  // Add to the database
  try {
    const mood = await Mood.create({ rating, emotions, hoursSlept, note, date });
    res.status(201).json(mood); // Use 201 for created
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a mood
const deleteMood = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such mood' });
  }

  try {
    const mood = await Mood.findOneAndDelete({ _id: id });

    if (!mood) {
      return res.status(404).json({ error: 'No such mood' });
    }

    res.status(200).json(mood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mood' });
  }
};

// Update a mood
const updateMood = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such mood' });
  }

  try {
    const mood = await Mood.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true } // Add options to return the updated document and run schema validation
    );

    if (!mood) {
      return res.status(404).json({ error: 'No such mood' });
    }

    res.status(200).json(mood);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getMood,
  getMoods,
  createMood,
  deleteMood,
  updateMood
};
