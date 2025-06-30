const express = require('express');
const serveIndex = require('serve-index');
const csv = require('csv-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Use cors middleware to remove CORS errors
app.use(cors());

// Serve static files from /home/ec2-user
app.use(express.static('/home/ec2-user'));

// Enable directory listing with icons (only if no index.html exists)
app.use(serveIndex('/home/ec2-user', { icons: true }));

// Basic API endpoint to check server status
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});






const readline = require('readline');

/**
 * GET /depth/timestamp
 * Reads the depth_measurements.csv file, skips the first 63 lines,
 * extracts the combined date and time from the first column, and
 * returns the timestamp as separate date and time fields.
 */
app.get('/depth/timestamp', (req, res) => {
  const csvFilePath = '/home/ec2-user/depth_measurements.csv';
  const timestamps = [];
  let lineCount = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(csvFilePath),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    lineCount++;
    if (lineCount <= 64) return; // Skip the first 63 lines

    // CSV is comma separated
    const tokens = line.split(',');
    if (tokens.length > 0) {
      // The first token is a combined "date time", e.g., "2025-06-12 10:16:59"
      const combined = tokens[0].trim();
      const dateTimeParts = combined.split(' ');
      if (dateTimeParts.length >= 2) {
        const datePart = dateTimeParts[0];
        const timePart = dateTimeParts.slice(1).join(' ');
        timestamps.push({ date: datePart, time: timePart ,average:parseFloat(tokens[tokens.length - 1])});
      }
    }
  });

  rl.on('close', () => {
    res.json(timestamps);
  });

  rl.on('error', (err) => {
    console.error('Error reading CSV:', err);
    res.status(500).json({ error: 'Failed to process CSV file' });
  });
});



/**
 * GET /depth/getdata
 * Expects query parameters: date and time.
 * Reads the /home/ec2-user/depth_measurements.csv file, skips the first 63 lines,
 * then finds the row with a matching date and time (from the first column).
 * Returns a JSON object with the date, time, and an array of 16 numeric values.
 */
app.get('/depth/getdata', (req, res) => {
  const targetDate = req.query.date; // expected format: "YYYY-MM-DD"
  const targetTime = req.query.time; // expected format: "HH:MM:SS"
  
  if (!targetDate || !targetTime) {
    return res.status(400).json({ error: "Please provide both date and time query parameters." });
  }

  const csvFilePath = '/home/ec2-user/depth_measurements.csv';
  const rl = require('readline').createInterface({
    input: fs.createReadStream(csvFilePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let foundData = null;

  rl.on('line', (line) => {
    lineCount++;
    if (lineCount <= 63) return; // Skip header/initial useless rows

    // Since the CSV is comma-separated, split by comma.
    const tokens = line.split(',');
    // We expect at least 17 tokens: 1 for timestamp and 16 for the values.
    if (tokens.length < 17) return;

    // The first token is expected to be "YYYY-MM-DD HH:MM:SS"
    const timestamp = tokens[0].trim();
    const parts = timestamp.split(' ');
    if (parts.length < 2) return;

    const datePart = parts[0];
    const timePart = parts[1];

    // Compare with the target date and time.
    if (datePart === targetDate && timePart === targetTime) {
      // Convert the remaining 16 tokens into numbers.
      const values = tokens.slice(1).map(item => parseFloat(item.trim()));
      foundData = { date: datePart, time: timePart, values: values };
      rl.close(); // We've found the matching entry; no need to read further.
    }
  });

  rl.on('close', () => {
    if (foundData) {
      res.json(foundData);
    } else {
      res.status(404).json({ error: "No matching data found for the provided date and time." });
    }
  });

  rl.on('error', (err) => {
    console.error("Error reading CSV:", err);
    res.status(500).json({ error: "Failed to process CSV file." });
  });
});


/**
 * GET /api/photos
 * Reads the photos folder and returns an array of objects,
 * each with the photo name and formatted creation timestamp.
 */
app.get('/api/photos', (req, res) => {
  const photosDir = '/home/ec2-user/photos';

  fs.readdir(photosDir, (err, files) => {
    if (err) {
      console.error('Error reading photos directory:', err);
      return res.status(500).json({ error: 'Unable to read photos directory' });
    }

    // Filter for JPG files (case insensitive)
    const photoFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));

    const photos = photoFiles.map(file => {
      const filePath = path.join(photosDir, file);
      const stats = fs.statSync(filePath);
      const timestamp = stats.birthtime;
      // Format timestamp like "6/21/2025, 8:53:49 AM"
      const formattedTimestamp = timestamp.toLocaleString('en-US', { hour12: true });
      return { name: file, timestamp: formattedTimestamp };
    });

    res.json(photos);
  });
});

/**
 * GET /photo-latest
 * Finds and returns the name of the most recent photo in the photos folder.
 */
app.get('/photo-latest', (req, res) => {
  const photosDir = '/home/ec2-user/photos';

  fs.readdir(photosDir, (err, files) => {
    if (err) {
      console.error('Error reading photos directory:', err);
      return res.status(500).json({ error: 'Unable to read photos directory' });
    }

    const photoFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));
    if (photoFiles.length === 0) {
      return res.status(404).json({ error: 'No photos found' });
    }

    let latestPhoto = photoFiles[0];
    let latestTime = fs.statSync(path.join(photosDir, latestPhoto)).birthtime.getTime();

    photoFiles.forEach(file => {
      const filePath = path.join(photosDir, file);
      const stats = fs.statSync(filePath);
      const fileTime = stats.birthtime.getTime();
      if (fileTime > latestTime) {
        latestTime = fileTime;
        latestPhoto = file;
      }
    });

    res.json({ name: latestPhoto });
  });
});

/**
 * GET /api/videos
 * Reads the videos folder and returns an array of objects,
 * each with the video file name and formatted creation timestamp.
 */
app.get('/api/videos', (req, res) => {
  const videosDir = '/home/ec2-user/videos';

  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading videos directory:', err);
      return res.status(500).json({ error: 'Unable to read videos directory' });
    }

    // Assuming video files use the .mp4 extension (adjust as needed)
    const videoFiles = files.filter(file => file.toLowerCase().endsWith('.mp4'));

    const videos = videoFiles.map(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      const timestamp = stats.birthtime;
      const formattedTimestamp = timestamp.toLocaleString('en-US', { hour12: true });
      return { name: file, timestamp: formattedTimestamp };
    });

    res.json(videos);
  });
});

/**
 * GET /video-latest
 * Finds and returns the name of the most recent video in the videos folder.
 */
app.get('/video-latest', (req, res) => {
  const videosDir = '/home/ec2-user/videos';

  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading videos directory:', err);
      return res.status(500).json({ error: 'Unable to read videos directory' });
    }

    const videoFiles = files.filter(file => file.toLowerCase().endsWith('.mp4'));
    if (videoFiles.length === 0) {
      return res.status(404).json({ error: 'No videos found' });
    }

    let latestVideo = videoFiles[0];
    let latestTime = fs.statSync(path.join(videosDir, latestVideo)).birthtime.getTime();

    videoFiles.forEach(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      const fileTime = stats.birthtime.getTime();
      if (fileTime > latestTime) {
        latestTime = fileTime;
        latestVideo = file;
      }
    });

    res.json({ name: latestVideo });
  });
});

app.get('/api/flow-angles', (req, res) => {
  const results = [];

  fs.createReadStream("/home/ec2-user/flow_angle.csv")
    .pipe(csv({ separator: ',' }))
    .on('data', (data) => {
      const timestamp = data['timestamp']?.trim();
      const flowAngle = parseFloat(data['flowangle']?.trim());

      if (timestamp && !isNaN(flowAngle)) {
        results.push({ timestamp, flowAngle });
      }
    })
    .on('end', () => {
      console.log(results)
      res.json(results);
    })
    .on('error', (err) => {
      res.status(500).json({ error: 'Failed to read CSV file', details: err.message });
    });
});


// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});