const express = require('express');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Ensure files directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// POST /create - generate a 100 MB file
app.post('/create', (req, res) => {
  const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const filename = `testfile-${id}.bin`;
  const filepath = path.join(FILES_DIR, filename);

  try {
    // Create 100 MB zero-filled file using dd (busybox)
    execSync(`dd if=/dev/zero of="${filepath}" bs=1M count=100`, { stdio: 'ignore' });
    res.json({
      success: true,
      url: `/download/${filename}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'File creation failed' });
  }
});

// GET /download/:filename - serve the file
app.get('/download/:filename', (req, res) => {
  const filepath = path.join(FILES_DIR, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('File not found');
  }
  res.download(filepath, req.params.filename);
});

// Health check
app.get('/', (req, res) => {
  res.send('Railway test file service is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
