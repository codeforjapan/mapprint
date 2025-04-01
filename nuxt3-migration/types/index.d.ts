/// <reference path="../@types/config.d.ts" />

// Re-export the MapPrint namespace for global use
import MapPrint from '../@types/config';
export { MapPrint };

// Declare global namespace to ensure it's available across the app
declare global {
  // Explicitly import the MapPrint namespace
  import MapPrint from '../@types/config';
}