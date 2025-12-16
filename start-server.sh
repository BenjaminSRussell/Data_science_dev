#!/bin/bash
# Start the development server

cd "$(dirname "$0")"

echo "🚀 Starting Data Science Tycoon Development Server..."
echo ""

# Add NVM node to PATH if it exists
if [ -d "$HOME/.nvm/versions/node" ]; then
    NODE_VERSION=$(ls -1 "$HOME/.nvm/versions/node" | tail -1)
    export PATH="$HOME/.nvm/versions/node/$NODE_VERSION/bin:$PATH"
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Using Node.js: $(node --version)"
echo "✅ Using npm: $(npm --version)"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    echo "Please install Node.js (which includes npm)"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "✅ Starting Vite dev server on http://localhost:5173"
echo ""
npm run dev

