#!/bin/bash
# Script to create public directories and copy files from the original project

# Create public directory structure
mkdir -p public/images
mkdir -p public/data/kml
mkdir -p public/geojson

# Copy static files to public directory
cp -r ../static/images/* public/images/ || echo "No images to copy"
cp ../static/favicon.ico ../static/apple-touch-icon.png ../static/ga.js public/ || echo "Some files not found"
cp -r ../static/data/kml/* public/data/kml/ || echo "No KML files to copy"
cp -r ../static/geojson/* public/geojson/ || echo "No GeoJSON files to copy"

echo "Public directories created and files copied"