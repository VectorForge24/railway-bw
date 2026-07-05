const express = require('express');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Create files directory if it doesn't exist
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Create the default 100 MB test file if missing
const DEFAULT_FILE = 'testfile-100mb.bin';
const defaultFilePath = path.join(FILES_DIR, DEFAULT_FILE);
if (!fs.existsSync(defaultFilePath)) {
  console.log('Creating default 100 MB file...');
  try {
    execSync(`dd if=/dev/zero of="${defaultFilePath}" bs=1M count=100`, { stdio: 'ignore' });
    console.log('Default file created.');
  } catch (err) {
    console.error('Failed to create default file:', err);
  }
}

// Serve files statically for direct downloads
app.use('/files', express.static(FILES_DIR));

// Root route – simple HTML listing page
app.get('/', (req, res) => {
  fs.readdir(FILES_DIR, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to list files');
    }

    const fileLinks = files
      .map(file => `<li><a href="/files/${encodeURIComponent(file)}">${file}</a></li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test File Server</title>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; margin: 2rem; }
          ul { list-style: none; padding: 0; }
          li { margin: 0.5rem 0; }
          a { font-size: 1.2rem; }
        </style>
      </head>
      <body>
        <h1>Available files</h1>
        <ul>${fileLinks || '<li>No files found.</li>'}</ul>
      </body>
      </html>
    `;
    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
