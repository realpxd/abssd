#!/bin/bash

# ABSSD Website - Start Script
# Starts both Frontend and Backend servers

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_FILE="$SCRIPT_DIR/.server_pids"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Check if servers are already running
if [ -f "$PID_FILE" ]; then
    echo -e "${YELLOW}Servers might already be running. Checking...${NC}"
    while read pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Server with PID $pid is already running.${NC}"
            echo -e "${YELLOW}Please run ./stop.sh first or kill the processes manually.${NC}"
            exit 1
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting ABSSD Website Servers${NC}"
echo -e "${BLUE}========================================${NC}"

# Start Backend
echo -e "\n${GREEN}Starting Backend server...${NC}"
cd "$SCRIPT_DIR/Backend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found in Backend directory.${NC}"
    echo -e "${YELLOW}Please create .env file with required environment variables.${NC}"
fi

npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" >> "$PID_FILE"
echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"
echo -e "${BLUE}Backend logs: backend.log${NC}"

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "\n${GREEN}Starting Frontend server...${NC}"
cd "$SCRIPT_DIR/Frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> "$PID_FILE"
echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
echo -e "${BLUE}Frontend logs: frontend.log${NC}"

# Wait a bit for frontend to start
sleep 3

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Servers Started Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC}  http://localhost:5000"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo -e "${YELLOW}Or run ./stop.sh to stop them${NC}\n"

# Keep script running and wait for processes
wait

