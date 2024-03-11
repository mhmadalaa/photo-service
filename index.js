require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', (err) => {
  console.log(err);
  db.close().catch((err) => console.log('Failed to close'));
});
db.on('connected', () => {
  console.log(`Connected to db`);
});
db.on('disconnected', () => {
  console.log(`Disconnected to db`);
});

// Create Photo schema
const photoSchema = new mongoose.Schema({
  data: Buffer, // Store binary data directly in the database
  contentType: String,
});

const Photo = mongoose.model('Photo', photoSchema);

// Set up multer for file upload
const upload = multer();

// Upload endpoint
app.post('/upload', upload.single('photo'), async (req, res) => {
  console.log(req.file);
  try {
    const newPhoto = new Photo({
      data: req.file.buffer, // Store the binary data of the uploaded photo
      contentType: req.file.mimetype, // Store the content type of the photo
    });
    await newPhoto.save();
    res.status(201).send('Photo uploaded successfully!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get photo by ID endpoint
app.get('/img/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    res.set('Content-Type', photo.contentType); // Set the content type of the response
    res.send(photo.data); // Send the binary data of the photo
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
