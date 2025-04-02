import { vi } from 'vitest';

// Mock window.URL.createObjectURL
if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
}

// Mock window.Worker
class MockWorker {
  constructor() {}
  addEventListener() {}
  removeEventListener() {}
  terminate() {}
  postMessage() {}
  onmessage() {}
  onerror() {}
}

global.Worker = MockWorker as any;

// Mock canvas functions if needed
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray([0, 0, 0, 0]),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
}));