const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const crypto = require('crypto');

console.log('Starting Flexa Server...');

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Flexa Server' });
});

// Main endpoint
app.get('/', (req, res) => {
  res.send('Flexa Web IDE is online');
});

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// WebSocket Server
try {
  const wss = new WebSocket.Server({ port: 4001, host: '0.0.0.0' }, () => {
    console.log('WebSocket server running on port 4001');
  });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.url);

    let currentContainer = null;
    const sessionId = crypto.randomBytes(8).toString('hex');
    const userDir = path.join(__dirname, '..', 'temp', sessionId);
    
    try {
      fs.mkdirSync(userDir, { recursive: true });
    } catch (err) {
      console.error('Error creating user directory:', err);
    }

    ws.on('message', (msg) => {
      // ... (seu código existente)
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (currentContainer) {
        currentContainer.kill();
        currentContainer = null;
      }
      try {
        fs.rmSync(userDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up directory:', err);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });
} catch (error) {
  console.error('WebSocket server error:', error);
}

// HTTP Server
app.listen(4000, '0.0.0.0', () => {
  console.log('HTTP server running on port 4000');
  console.log('Test URL: http://localhost:4000/');
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
