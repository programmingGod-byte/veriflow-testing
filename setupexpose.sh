#!/bin/bash
set -e

# 1. Download and install nvm:
echo "Installing nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 2. Immediately load nvm (in lieu of restarting the shell)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Download and install Node.js version 22:
echo "Installing Node.js version 22..."
nvm install 22

# 4. Verify the Node.js and npm versions:
echo "Node version: $(node -v) (should be v22.xx)"
echo "Current Node version: $(nvm current)"
echo "npm version: $(npm -v)"

# 5. Create a folder "exposed" and go inside it:
echo "Creating 'exposed' folder..."
mkdir -p exposed
cd exposed

# 6. Run npm init -y to generate package.json:
echo "Initializing npm project..."
npm init -y

# 7. Create server.js file with the provided content:
cat << 'EOF' > server.js
const express = require('express');
const serveIndex = require('serve-index');
const cors = require('cors');

const app = express();

// Use cors middleware to remove CORS errors
app.use(cors());

// Serve static files from /home/ec2-user
app.use(express.static('/home/ec2-user'));

// Enable directory listing with icons (only if no index.html exists)
app.use(serveIndex('/home/ec2-user', { icons: true }));

// Optional: Create a basic API endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start the server on port 5000
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
EOF

# 8. Install package dependencies:
echo "Installing dependencies: cors, express, serve-index..."
npm install cors express serve-index

# 9. Install PM2 globally:
echo "Installing pm2 globally..."
npm install -g pm2

echo "Setup complete! You can now start your server using:"
echo "  pm2 start server.js"
