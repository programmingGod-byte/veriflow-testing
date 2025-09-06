const express = require('express');
const serveIndex = require('serve-index');
const csv = require('csv-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const allowedOrigins = ['https://visiflow-tech.vercel.app/'];
const allowedIps = ['127.0.0.1']; // Add your specific IPs

/**
 * Middleware to check if the request comes from an allowed IP or Origin.
 */
const securityCheck = (req, res, next) => {
  const origin = req.get('Origin');
  const ip = req.ip;

  console.log(`Request from IP: ${ip}, Origin: ${origin}`); // For debugging

  // Allow the request if the IP or Origin is in our whitelist
  if (allowedOrigins.includes(origin) || allowedIps.includes(ip)) {
    next(); // It's a valid source, proceed to the next middleware/route handler
  } else {
    // If not in the whitelist, block the request
    res.status(403).json({ error: 'Forbidden: Access denied.' });
  }
};

const app = express();

// Use cors middleware to remove CORS errors
app.use(cors());

// IMPORTANT: Enable Express to trust the proxy to get the correct IP
// This is crucial if your app is behind a load balancer or reverse proxy (like Nginx)
app.set('trust proxy', 1);

// <<< ADD THIS LINE TO APPLY THE SECURITY CHECK >>>
app.use(securityCheck);

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




/* REFACTORED CODE                 */
const knownFormats = ['M/D/YY H:mm', 'YYYY-MM-DD HH:mm:ss'];

/**
 * Try to parse a date using multiple formats
 */
function parseDate(raw) {
  for (const format of knownFormats) {
    const m = moment(raw, format, true); // strict mode
    if (m.isValid()) return m;
  }
  return null;
}

// Route 1: past N days
app.get('/newversion/depth/timestamp/:days', (req, res) => {
  const csvFilePath = '/home/ec2-user/depth_measurements.csv';
  const days = parseInt(req.params.days, 10);
  if (isNaN(days) || days < 1) {
    return res.status(400).json({ error: 'Invalid number of days' });
  }

  const thresholdDate = moment().subtract(days, 'days');
  const resultsMap = new Map(); // Use a Map to store unique results

  const rl = readline.createInterface({
    input: fs.createReadStream(csvFilePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  rl.on('line', (line) => {
    lineCount++;
    if (lineCount === 1) return; // Skip header

    const tokens = line.split(',');
    const rawDate = tokens[0].trim();
    const parsedDate = parseDate(rawDate);

    if (!parsedDate) {
      console.warn(`Invalid date format on line ${lineCount}: ${rawDate}`);
      return;
    }

    if (parsedDate.isSameOrAfter(thresholdDate)) {
      const timestamp = parsedDate.format('M/D/YY H:mm');
      const meanDepth = parseFloat(tokens[tokens.length - 1]);
      // Add to map (duplicates with the same timestamp key are automatically handled)
      resultsMap.set(timestamp, meanDepth);
    }
  });

  rl.on('close', () => {
    // Convert map to the desired array format
    const uniqueResults = Array.from(resultsMap, ([timestamp, mean_depth]) => ({
      timestamp,
      mean_depth,
    }));
    res.json(uniqueResults);
  });

  rl.on('error', (err) => {
    console.error('Error reading CSV:', err);
    res.status(500).json({ error: 'Failed to process CSV file' });
  });
});

// Route 2: between two timestamps
app.get('/new/version/timestamp/:time1&:time2', (req, res) => {
  const csvFilePath = '/home/ec2-user/depth_measurements.csv';
  const { time1, time2 } = req.params;

  const start = moment(decodeURIComponent(time1), 'YYYY-MM-DD HH:mm', true);
  const end = moment(decodeURIComponent(time2), 'YYYY-MM-DD HH:mm', true);

  if (!start.isValid() || !end.isValid()) {
    return res.status(400).json({ error: 'Invalid time format. Use YYYY-MM-DD HH:mm' });
  }

  const resultsMap = new Map(); // Use a Map to store unique results

  const rl = readline.createInterface({
    input: fs.createReadStream(csvFilePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  rl.on('line', (line) => {
    lineCount++;
    if (lineCount === 1) return; // Skip header

    const tokens = line.split(',');
    const rawDate = tokens[0].trim();
    const parsedDate = parseDate(rawDate);

    if (!parsedDate) {
      console.warn(`Invalid date format on line ${lineCount}: ${rawDate}`);
      return;
    }

    if (parsedDate.isBetween(start, end, undefined, '[]')) {
      const timestamp = parsedDate.format('M/D/YY H:mm');
      const meanDepth = parseFloat(tokens[tokens.length - 1]);
      // Add to map (duplicates with the same timestamp key are automatically handled)
      resultsMap.set(timestamp, meanDepth);
    }
  });

  rl.on('close', () => {
    // Convert map to the desired array format
    const uniqueResults = Array.from(resultsMap, ([timestamp, mean_depth]) => ({
      timestamp,
      mean_depth,
    }));
    res.json(uniqueResults);
  });

  rl.on('error', (err) => {
    console.error('Error reading CSV:', err);
    res.status(500).json({ error: 'Failed to process CSV file' });
  });
});

app.get('/latest-width', (req, res) => {
  const filePath = "/home/ec2-user/width.csv";

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim() !== '');

    if (lines.length < 2) {
      return res.status(404).json({ error: 'Not enough data in CSV' });
    }

    const lastLine = lines[lines.length - 1];
    const secondLastLine = lines[lines.length - 2];

    const parseLine = (line) => {
      const [timestamp, widthStr] = line.trim().split(',');
      const width = parseFloat(widthStr);
      return { timestamp, width };
    };

    const last = parseLine(lastLine);
    const secondLast = parseLine(secondLastLine);

    if (!last.timestamp || isNaN(last.width) || !secondLast.timestamp || isNaN(secondLast.width)) {
      return res.status(400).json({ error: 'Invalid CSV format' });
    }

    res.json({ last, secondLast });

  } catch (err) {
    console.error('Error reading CSV:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});





