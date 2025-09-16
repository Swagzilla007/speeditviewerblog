#!/bin/bash

# Build Next.js app
npm run build

# Ensure output directory exists
if [ ! -d ".next" ]; then
  echo "Error: .next directory not found after build"
  exit 1
fi

echo "Build completed successfully"