const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());


// 🔐 Firebase Admin SDK
const serviceAccount = require('./python-editor-auth-firebase-adminsdk-fbsvc-2f839704fc.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 📦 MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);
const dbName = 'editor_logs';

// 🧠 Token Verification Middleware
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
};

// 🌐 Static files (CSS, JS)
app.use('/static', express.static(path.join(__dirname, 'public/static')));

// 🖼️ HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login-signup.html'));
});
app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 📤 Log writing (auth protected)
app.post('/api/log', verifyFirebaseToken, async (req, res) => {
  try {
    const logs = req.body;
    const userEmail = req.user.email;

    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('keystrokes');

    await collection.insertMany(logs.map(entry => ({
      ...entry,
      email: userEmail,
      time: new Date(entry.time),
    })));

    res.status(200).json({ message: 'Logs securely stored' });
  } catch (err) {
    console.error('❌ Error saving logs:', err);
    res.status(500).json({ error: 'Failed to store logs' });
  }
});

// 📥 Log reading (open access)
app.get('/api/logs', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('keystrokes');
    const logs = await collection.find({}).toArray();
    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// 🟢 Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Secure API ready on port ${PORT}`);
});
