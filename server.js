import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Ensure dist exists; if not built yet (e.g. Render only ran install), build it
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('Production build not found. Building now...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.error('Build error:', err);
  }
}

// Body parsers for image and APK upload (up to 100mb)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure public/uploads directory exists
const uploadsDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const serverMemoryUploads = new Map();

// Serve memory uploaded images first
app.use('/uploads/:filename', (req, res, next) => {
  const filename = req.params.filename;
  if (filename && serverMemoryUploads.has(filename)) {
    const item = serverMemoryUploads.get(filename);
    res.setHeader('Content-Type', item.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(item.buffer);
  }
  next();
});

// Image Upload Endpoint (Permanent local hosting)
app.post('/api/upload-image', (req, res) => {
  try {
    let base64 = req.body?.base64 || '';
    if (base64.includes(',')) {
      base64 = base64.split(',')[1];
    }

    if (!base64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const ext = req.body?.ext || 'jpg';
    const filename = `movie_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const buffer = Buffer.from(base64, 'base64');
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    // Store in-memory buffer cache (zero disk-write to prevent file watcher browser reloads)
    serverMemoryUploads.set(filename, { buffer, mime });

    return res.status(200).json({
      success: true,
      url: `/uploads/${filename}`
    });
  } catch (err) {
    console.error('Upload image error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Direct APK Upload Endpoint (Saves custom .apk directly to public and dist)
app.post('/api/upload-apk', (req, res) => {
  try {
    let base64 = req.body?.base64 || '';
    if (base64.includes(',')) {
      base64 = base64.split(',')[1];
    }

    if (!base64) {
      return res.status(400).json({ error: 'No APK file data provided' });
    }

    const buffer = Buffer.from(base64, 'base64');
    const pubApk = path.resolve(__dirname, 'public/CineStreamBD.apk');
    const distApk = path.join(distDir, 'CineStreamBD.apk');

    fs.writeFileSync(pubApk, buffer);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(distApk, buffer);
    }

    console.log(`Successfully uploaded CineStreamBD.apk (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

    return res.status(200).json({
      success: true,
      url: '/CineStreamBD.apk',
      size: buffer.length
    });
  } catch (err) {
    console.error('Upload APK error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 1. Direct APK & Project Bundle Download Streams
app.get(['/api/download-project-zip', '/CineStreamBD_Project_v2.3.0.zip'], (req, res) => {
  const zipPath = path.resolve(__dirname, 'public/CineStreamBD_Project_v2.3.0.zip');
  if (fs.existsSync(zipPath)) {
    const stat = fs.statSync(zipPath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="CineStreamBD_Project_v2.3.0.zip"',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    const stream = fs.createReadStream(zipPath);
    return stream.pipe(res);
  } else {
    return res.status(404).send('Project package not found');
  }
});

app.get(['/api/download-apk', '/CineStreamBD.apk', '/CineStreamBD_v2.3.0.apk', '/CineStreamBD_v2.1.0.apk'], (req, res) => {
  const customPubApk = path.resolve(__dirname, 'public/CineStreamBD.apk');
  const customDistApk = path.join(distDir, 'CineStreamBD.apk');
  const distApk = path.join(distDir, 'CineStreamBD_v2.3.0.apk');
  const pubApk = path.resolve(__dirname, 'public/CineStreamBD_v2.3.0.apk');

  const apkPath = [customPubApk, customDistApk, distApk, pubApk].find(p => fs.existsSync(p));

  if (apkPath && fs.existsSync(apkPath)) {
    const stat = fs.statSync(apkPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="CineStreamBD.apk"',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    const stream = fs.createReadStream(apkPath);
    stream.pipe(res);
  } else {
    res.redirect('/api/download-project-zip');
  }
});

// 2. Serve static dist files
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // Single Page App fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.use(express.static(path.resolve(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Vidmax web service running on http://0.0.0.0:${port}`);
});
