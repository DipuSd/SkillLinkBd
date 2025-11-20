#!/bin/bash

# Bash script to start both frontend and backend servers
# Usage: ./start-dev.sh

echo "🚀 Starting SkillLinkBD Development Servers..."
echo ""

# Colors for output
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $FRONTEND_PID $SERVER_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start frontend server
echo -e "${GREEN}✅ Frontend server starting on http://localhost:5173${NC}"
npm run dev > >(sed "s/^/[FRONTEND] /" | sed "s/^/\\${CYAN}/" | sed "s/$/\\${NC}/") 2>&1 &
FRONTEND_PID=$!

# Start backend server
echo -e "${GREEN}✅ Backend server starting on http://localhost:4000${NC}"
cd server && npm run dev > >(sed "s/^/[SERVER] /" | sed "s/^/\\${YELLOW}/" | sed "s/$/\\${NC}/") 2>&1 &
SERVER_PID=$!

cd ..

echo ""
echo -e "${YELLOW}📝 Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $FRONTEND_PID $SERVER_PID

