#!/bin/bash

# OSDG Web - Docker Deployment Helper Script

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    OSDG Web - Docker Deployment       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Initialize data directory
echo ""
echo -e "${YELLOW}Initializing data directory...${NC}"
./scripts/init-data.sh

# Build and start containers
echo ""
echo -e "${YELLOW}Building Docker image...${NC}"
docker-compose build

echo ""
echo -e "${YELLOW}Starting container...${NC}"
docker-compose up -d

# Wait for container to be healthy
echo ""
echo -e "${YELLOW}Waiting for application to start...${NC}"
sleep 3

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Deployment Successful! 🎉          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Application URL:${NC} http://localhost:3000"
    echo -e "${BLUE}Data Location:${NC} $(pwd)/data"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  View logs:        docker-compose logs -f"
    echo "  Stop container:   docker-compose down"
    echo "  Restart:          docker-compose restart"
    echo "  View status:      docker-compose ps"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Container failed to start${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
