#!/bin/bash

# Script to initialize the data directory for OSDG Web

echo "Initializing OSDG Web data directory..."

# Create data directory if it doesn't exist
mkdir -p data

# Create initial projects.json if it doesn't exist
if [ ! -f data/projects.json ]; then
  echo "Creating initial projects.json..."
  echo "[]" > data/projects.json
  echo "✓ Created data/projects.json"
else
  echo "✓ data/projects.json already exists"
fi

# Set proper permissions (Unix/Linux/Mac)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
  chmod 777 data
  chmod 666 data/projects.json 2>/dev/null || true
  echo "✓ Set permissions on data directory"
fi

echo ""
echo "Data directory initialized successfully!"
echo "Location: $(pwd)/data"
echo ""
echo "You can now run:"
echo "  - Development: pnpm dev"
echo "  - Docker: docker-compose up -d"
