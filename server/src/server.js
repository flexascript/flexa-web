const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const crypto = require('crypto');

console.log('Starting Flexa Server...');

const app = express();
app.use(express.json());

const HOST_TEMP_PATH = process.env.HOST_TEMP_PATH || '/app/temp';

function resolveHostPath(userDir) {
  if (fs.existsSync('/.dockerenv')) {
    const relativePath = path.relative('/app/temp', userDir);
    return path.resolve(HOST_TEMP_PATH, relativePath);
  }
  return userDir;
}

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
      try {
        const parsed = JSON.parse(msg);

        if (parsed.type === 'code') {
          const filePath = path.join(userDir, 'main.flx');
          fs.writeFileSync(filePath, parsed.code);

          if (currentContainer) {
            currentContainer.kill();
            currentContainer = null;
          }

          const hostPath = resolveHostPath(userDir);
          const dockerCmd = spawn('docker', [
            'run', '--rm', '-i',
            '--memory=64m', '--cpus=0.2',
            '-v', `${hostPath}:/code`,
            '--name', `flexa_${sessionId}`,
            'flexa-interpreter-image',
            '/code/main.flx'
          ]);

          currentContainer = dockerCmd;

          const timeout = setTimeout(() => {
            if (currentContainer) {
              currentContainer.kill();
              currentContainer = null;
            }
          }, 1000 * 60 * 5);

          dockerCmd.stdout.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
          });

          dockerCmd.stderr.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'error', data: data.toString() }));
          });

          dockerCmd.on('close', (code) => {
            clearTimeout(timeout);
            ws.send(JSON.stringify({ type: 'exit', code }));
          });
        }

        if (parsed.type === 'input' && currentContainer) {
          currentContainer.stdin.write(parsed.data + '\n');
        }

        if (parsed.type === 'stop' && currentContainer) {
          // stop container explicitly by name
          spawn('docker', ['stop', `flexa_${sessionId}`]);

          // remove it just in case
          spawn('docker', ['rm', '-f', `flexa_${sessionId}`]);

          currentContainer.kill('SIGKILL');
          currentContainer = null;
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
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

// HTTP Server
app.listen(4000, '0.0.0.0', () => {
  console.log('HTTP server running on port 4000');
  console.log('Test URL: http://localhost:4000/');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
