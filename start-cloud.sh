#!/bin/bash

# Enhanced Auto-Bootstrap Script - Handles everything automatically
echo "🚀 Sparx Science - Cloud AI Sync Auto-Bootstrap"
echo "================================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 System Check${NC}"
echo "==============="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found!${NC}"
    echo "Please install Node.js 14+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo -e "${GREEN}✅ NPM version: $(npm --version)${NC}"
echo ""

# Check and install dependencies if needed
echo -e "${BLUE}📦 Dependency Management${NC}"
echo "========================"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies (first run)...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""

# Create data directory if it doesn't exist
echo -e "${BLUE}📁 Directory Setup${NC}"
echo "==================="

if [ ! -d "data" ]; then
    mkdir -p data
    echo -e "${GREEN}✅ Created data directory${NC}"
else
    echo -e "${GREEN}✅ Data directory ready${NC}"
fi

echo ""

# Show startup information
echo -e "${BLUE}🌐 Server Information${NC}"
echo "===================="
echo "  Port: 3000"
echo "  URL: http://localhost:3000"
echo ""

echo -e "${BLUE}✨ Features Enabled${NC}"
echo "==================="
echo "  • AI learns collectively from all users"
echo "  • Data syncs every 30 seconds"
echo "  • Works offline with automatic sync"
echo "  • Machine learning with NLP"
echo "  • Global learning database"
echo ""

echo -e "${BLUE}📊 Features${NC}"
echo "============"
echo "  • Cloud-synchronized learning"
echo "  • Offline-first architecture"
echo "  • Persistent data storage"
echo "  • Collective intelligence"
echo "  • User anonymity"
echo ""

# Display usage information
echo -e "${BLUE}💡 Usage Tips${NC}"
echo "============"
echo "  • Press Ctrl+C to stop the server"
echo "  • Server auto-restarts on crashes"
echo "  • Data persists across restarts"
echo "  • Check console for sync status"
echo ""

# Start the server
echo -e "${GREEN}🚀 Starting Sparx Science Server...${NC}"
echo "======================================"
echo ""

exec npm start

