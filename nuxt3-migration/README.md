# MapPrint (Nuxt 3 Version)

A disaster response map tool that specializes in printing.
紙でも使える災害情報マップ

## Description

This is the Nuxt 3 + Vue 3 version of the MapPrint tool, which allows you to print disaster support information such as the location of evacuation centers, water supply points, etc.

## Key Features

- Printable information of evacuation centers and water supply points
- Support for multiple languages
- Importable data from various sources (Google My Maps, uMap, KML, GeoJSON)
- QR code to allow linking between digital and paper

## Technology Stack

- Nuxt 3
- Vue 3 (Composition API)
- MapLibre GL JS (Open source fork of Mapbox GL)
- TypeScript
- SCSS
- Pug templates

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate static project
npm run generate
```

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Code for Japan](https://www.code4japan.org/)
- [CfJ Disaster Response Study Group](https://www.code4japan.org/activity/disaster-response)