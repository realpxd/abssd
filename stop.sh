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
LOG_DIR="$SCRIPT_DIR/logs"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Stopping ABSSD Website Servers${NC}"
echo -e "${YELLOW}========================================${NC}"

PID_EXISTS=false
if [ -f "$PID_FILE" ]; then
  PID_EXISTS=true
fi

if [ "$PID_EXISTS" = false ]; then
    echo -e "${YELLOW}No PID file found. Servers might not be running.${NC}"
    
    # Try to find and kill processes by port
    echo -e "${YELLOW}Checking for processes on ports 5173 and 5000...${NC}"
    
    # Kill frontend (Vite usually runs on 5173)
    if command -v lsof >/dev/null 2>&1; then
      FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || true)
      BACKEND_PID=$(lsof -ti:5000 2>/dev/null || true)
    else
      # fallback: try ss or netstat
      FRONTEND_PID=$(ss -ltnp 2>/dev/null | grep ':5173' | sed -n 's/.*pid=\([0-9]*\),.*/\1/p' || true)
      BACKEND_PID=$(ss -ltnp 2>/dev/null | grep ':5000' | sed -n 's/.*pid=\([0-9]*\),.*/\1/p' || true)
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${GREEN}Found frontend process on port 5173 (PID: $FRONTEND_PID)${NC}"
        kill "$FRONTEND_PID" 2>/dev/null && echo -e "${GREEN}Frontend stopped${NC}" || echo -e "${RED}Failed to stop frontend${NC}"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${GREEN}Found backend process on port 5000 (PID: $BACKEND_PID)${NC}"
        kill "$BACKEND_PID" 2>/dev/null && echo -e "${GREEN}Backend stopped${NC}" || echo -e "${RED}Failed to stop backend${NC}"
    fi
    
    if [ -z "$FRONTEND_PID" ] && [ -z "$BACKEND_PID" ]; then
        echo -e "${YELLOW}No servers found running.${NC}"
    fi
    
    exit 0
fi

# Read labeled PIDs from file and kill them gracefully
STOPPED=0
while IFS= read -r line || [ -n "$line" ]; do
        if [ -z "$line" ]; then
            continue
        fi
        # expected format label:pid
        label=$(echo "$line" | cut -d":" -f1)
        pid=$(echo "$line" | cut -d":" -f2)
        if [ -z "$pid" ]; then
            continue
        fi
        if kill -0 "$pid" 2>/dev/null; then
                echo -e "${GREEN}Stopping $label (PID $pid)...${NC}"
                kill "$pid" 2>/dev/null || true
                # wait up to 5s
                for i in {1..5}; do
                    if kill -0 "$pid" 2>/dev/null; then
                        sleep 1
                    else
                        break
                    fi
                done
                if kill -0 "$pid" 2>/dev/null; then
                    echo -e "${YELLOW}$label did not stop, forcing...${NC}"
                    kill -9 "$pid" 2>/dev/null || true
                fi
                if ! kill -0 "$pid" 2>/dev/null; then
                    STOPPED=$((STOPPED + 1))
                    echo -e "${GREEN}$label stopped.${NC}"
                else
                    echo -e "${RED}Failed to stop $label (${pid})${NC}"
                fi
        else
                echo -e "${YELLOW}$label (PID $pid) is not running${NC}"
        fi
done < "$PID_FILE"

# Remove PID file
rm -f "$PID_FILE"

# As a final precaution, try to kill by known ports (5173, 5000)
if command -v lsof >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || true)
    BACKEND_PID=$(lsof -ti:5000 2>/dev/null || true)
else
    FRONTEND_PID=$(ss -ltnp 2>/dev/null | grep ':5173' | sed -n 's/.*pid=\([0-9]*\),.*/\1/p' || true)
    BACKEND_PID=$(ss -ltnp 2>/dev/null | grep ':5000' | sed -n 's/.*pid=\([0-9]*\),.*/\1/p' || true)
fi

for p in $FRONTEND_PID; do
    if [ -n "$p" ]; then
        echo -e "${GREEN}Stopping frontend on port 5173 (PID: $p)...${NC}"
        kill "$p" 2>/dev/null || true
        STOPPED=$((STOPPED + 1))
    fi
done

for p in $BACKEND_PID; do
    if [ -n "$p" ]; then
        echo -e "${GREEN}Stopping backend on port 5000 (PID: $p)...${NC}"
        kill "$p" 2>/dev/null || true
        STOPPED=$((STOPPED + 1))
    fi
done

if [ $STOPPED -gt 0 ]; then
        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}  Servers Stopped Successfully!${NC}"
        echo -e "${GREEN}========================================${NC}"
else
        echo -e "\n${YELLOW}No running servers found to stop.${NC}"
fi

