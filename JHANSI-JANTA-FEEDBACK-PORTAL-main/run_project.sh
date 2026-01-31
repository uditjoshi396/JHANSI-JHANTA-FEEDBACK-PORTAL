#!/bin/bash

echo "========================================"
echo "Janata Feedback Portal Setup Script"
echo "========================================"
echo "This script will set up and run the project."
echo "Ensure Node.js, npm, and MongoDB are installed."
echo

# Check if MongoDB is running (basic check)
if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Please start MongoDB first."
    read -p "Press enter to exit..."
    exit 1
fi

echo "MongoDB is running. Proceeding..."
echo

# Server setup
echo "Setting up server..."
cd server
if [ ! -f .env ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "Please edit .env file with your configurations (MONGO_URI, JWT_SECRET, etc.)."
    read -p "Press enter after editing .env..."
fi
echo "Installing server dependencies..."
npm install
echo "Starting server in background..."
npm run dev &
cd ..
echo

# Client setup
echo "Setting up client..."
cd client
echo "Installing client dependencies..."
npm install
echo "Starting client..."
npm start &
cd ..
echo

echo "========================================"
echo "Setup complete!"
echo "- Server running at http://localhost:5000"
echo "- Client running at http://localhost:3000"
echo "========================================"
read -p "Press enter to exit..."
