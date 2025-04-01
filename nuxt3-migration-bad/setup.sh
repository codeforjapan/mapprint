#!/bin/bash

# Setup script for the Nuxt 3 migration project
echo "Setting up the Nuxt 3 migration environment..."

# Create necessary directories
mkdir -p .nuxt
mkdir -p public/images
mkdir -p public/data
mkdir -p public/geojson
mkdir -p assets/config
mkdir -p assets/images
mkdir -p assets/sass
mkdir -p assets/fonts/fontawesome/css
mkdir -p locales

# Copy config files from original project
echo "Copying config files..."
cp -r ../assets/config/* assets/config/ 2>/dev/null || echo "No config files found"

# Copy original static files to public directory
echo "Copying static files to public directory..."
cp -r ../static/images/* public/images/ 2>/dev/null || echo "No static images found"
cp -r ../static/data/* public/data/ 2>/dev/null || echo "No static data found"
cp -r ../static/geojson/* public/geojson/ 2>/dev/null || echo "No static geojson found"
cp ../static/favicon.ico public/ 2>/dev/null || echo "No favicon found"
cp ../static/CNAME public/ 2>/dev/null || echo "No CNAME found"
cp ../static/ga.js public/ 2>/dev/null || echo "No ga.js found"

# Copy asset files
echo "Copying asset files..."
cp -r ../assets/images/* assets/images/ 2>/dev/null || echo "No asset images found"
cp -r ../assets/sass/* assets/sass/ 2>/dev/null || echo "No sass files found"
cp -r ../assets/fonts/* assets/fonts/ 2>/dev/null || echo "No font files found"

# If Font Awesome CSS doesn't exist, create a placeholder
if [ ! -f "assets/fonts/fontawesome/css/all.css" ]; then
  echo "Creating placeholder Font Awesome CSS file..."
  echo "/* Placeholder for Font Awesome CSS */" > assets/fonts/fontawesome/css/all.css
  echo "/* This should be replaced with the actual Font Awesome files */" >> assets/fonts/fontawesome/css/all.css
  echo "@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');" >> assets/fonts/fontawesome/css/all.css
fi

# Copy locale files
echo "Copying locale files..."
cp -r ../locales/* locales/ 2>/dev/null || echo "No locale files found"

# Make sure at least ja.json and en.json exist
if [ ! -f "locales/ja.json" ]; then
  echo "Creating minimal ja.json file..."
  echo '{
  "common": {
    "site_name": "紙マップ",
    "site_desc": "地図情報を印刷できる「紙マップ」",
    "share": "シェア",
    "about": "このサイトについて",
    "contribute": "開発参加者募集中",
    "title": "地図情報を印刷できる「紙マップ」"
  },
  "PrintableMap": {
    "name": "名称：",
    "print": "印刷",
    "legend": "凡例",
    "show_all": "すべて表示",
    "close_area_select": "地域選択を閉じる",
    "back_to_map": "元の地図へ",
    "no_point_in_map": "表示中のマップにはどのポイントも存在しません",
    "close_list": "リストを閉じる"
  }
}' > locales/ja.json
fi

if [ ! -f "locales/en.json" ]; then
  echo "Creating minimal en.json file..."
  echo '{
  "common": {
    "site_name": "Paper Map",
    "site_desc": "Service for printing web maps",
    "share": "Share",
    "about": "About this site",
    "contribute": "Join development",
    "title": "Paper Map"
  },
  "PrintableMap": {
    "name": "Name:",
    "print": "Print",
    "legend": "Legend",
    "show_all": "Show all",
    "close_area_select": "Close selection",
    "back_to_map": "Back to map",
    "no_point_in_map": "No information in this area",
    "close_list": "Close list"
  }
}' > locales/en.json
fi

# Set environment variable for disabling TypeScript checking
echo "NUXT_TYPESCRIPT_CHECK=false" > .env

echo "Setup complete! You can now run 'npm run dev' to start the development server."
echo "Note: If you still see errors, you may need to manually copy specific files or adjust component references."