#!/bin/bash

# ABSSD Website - Stop Script
# Stops both Frontend and Backend servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_FILE="$SCRIPT_DIR/.server_pids"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Stopping ABSSD Website Servers${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}No PID file found. Servers might not be running.${NC}"
    
    # Try to find and kill processes by port
    echo -e "${YELLOW}Checking for processes on ports 5173 and 5000...${NC}"
    
    # Kill frontend (Vite usually runs on 5173)
    FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || true)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${GREEN}Found frontend process on port 5173 (PID: $FRONTEND_PID)${NC}"
        kill "$FRONTEND_PID" 2>/dev/null && echo -e "${GREEN}Frontend stopped${NC}" || echo -e "${RED}Failed to stop frontend${NC}"
    fi
    
    # Kill backend (Express usually runs on 5000)
    BACKEND_PID=$(lsof -ti:5000 2>/dev/null || true)
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${GREEN}Found backend process on port 5000 (PID: $BACKEND_PID)${NC}"
        kill "$BACKEND_PID" 2>/dev/null && echo -e "${GREEN}Backend stopped${NC}" || echo -e "${RED}Failed to stop backend${NC}"
    fi
    
    if [ -z "$FRONTEND_PID" ] && [ -z "$BACKEND_PID" ]; then
        echo -e "${YELLOW}No servers found running.${NC}"
    fi
    
    exit 0
fi

# Read PIDs from file and kill them
STOPPED=0
while read pid; do
    if [ ! -z "$pid" ]; then
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}Stopping process $pid...${NC}"
            kill "$pid" 2>/dev/null && STOPPED=$((STOPPED + 1)) || echo -e "${RED}Failed to stop process $pid${NC}"
        else
            echo -e "${YELLOW}Process $pid is not running${NC}"
        fi
    fi
done < "$PID_FILE"

# Remove PID file
rm -f "$PID_FILE"

# Also try to kill by port as backup
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || true)
if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${GREEN}Stopping frontend on port 5173 (PID: $FRONTEND_PID)...${NC}"
    kill "$FRONTEND_PID" 2>/dev/null && STOPPED=$((STOPPED + 1))
fi

BACKEND_PID=$(lsof -ti:5000 2>/dev/null || true)
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${GREEN}Stopping backend on port 5000 (PID: $BACKEND_PID)...${NC}"
    kill "$BACKEND_PID" 2>/dev/null && STOPPED=$((STOPPED + 1))
fi

if [ $STOPPED -gt 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Servers Stopped Successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "\n${YELLOW}No running servers found to stop.${NC}"
fi

