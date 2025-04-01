#!/bin/bash

# Content migration script for Nuxt 3 migration
echo "Starting content migration from original project to Nuxt 3 migration..."

# Create necessary directories
mkdir -p public/images
mkdir -p assets/config
mkdir -p assets/images
mkdir -p locales

# Copy config files
echo "Copying config files..."
cp -r ../assets/config/* assets/config/

# Copy static images to public directory
echo "Copying static images to public directory..."
cp -r ../static/images/* public/images/ 2>/dev/null || echo "No static images found"

# Copy asset images 
echo "Copying asset images..."
cp -r ../assets/images/* assets/images/ 2>/dev/null || echo "No asset images found"

# Copy locales
echo "Copying locale files..."
cp -r ../locales/* locales/

echo "Content migration complete!"
echo "Note: You may need to update references to assets in components and pages."