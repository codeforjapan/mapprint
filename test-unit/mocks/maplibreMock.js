// maplibre-gl の Map / Marker / Popup / 各 Control の差し替え。
// jest.mock のファクトリはファイル先頭に巻き上げられるため、テストファイル内で
// class を宣言すると参照時点で undefined になる。別モジュールに置いて
// ファクトリ内から require することで確実に解決させる。

export const mapInstances = [];
export const markerInstances = [];
export const popupInstances = [];

export const resetInstances = () => {
  mapInstances.length = 0;
  markerInstances.length = 0;
  popupInstances.length = 0;
};

export class MockMap {
  constructor(options) {
    this.options = options;
    this.handlers = {};
    this.controls = [];
    this.fitBoundsCalls = [];
    this.removed = false;
    mapInstances.push(this);
  }

  on(event, cb) {
    (this.handlers[event] = this.handlers[event] || []).push(cb);
    return this;
  }

  fire(event) {
    (this.handlers[event] || []).forEach((cb) => cb());
  }

  addControl(control) {
    this.controls.push(control);
    return this;
  }

  fitBounds(bounds, options) {
    this.fitBoundsCalls.push({ bounds, options });
    return this;
  }

  getBounds() {
    const MapLibre = jest.requireActual('maplibre-gl');
    return new MapLibre.LngLatBounds(
      new MapLibre.LngLat(130.6, 32.5),
      new MapLibre.LngLat(130.8, 32.7)
    );
  }

  remove() {
    this.removed = true;
  }
}

export class MockMarker {
  constructor(options) {
    this.options = options;
    this.lngLat = null;
    this.popup = null;
    this.addedTo = null;
    this.removed = false;
    markerInstances.push(this);
  }

  setLngLat(lngLat) {
    this.lngLat = lngLat;
    return this;
  }

  setPopup(popup) {
    this.popup = popup;
    return this;
  }

  addTo(map) {
    this.addedTo = map;
    return this;
  }

  remove() {
    this.removed = true;
    return this;
  }
}

export class MockPopup {
  constructor(options) {
    this.options = options;
    this.dom = null;
    this.html = null;
    popupInstances.push(this);
  }

  setDOMContent(dom) {
    this.dom = dom;
    return this;
  }

  setHTML(html) {
    this.html = html;
    return this;
  }
}

export class MockNavigationControl {}

export class MockGeolocateControl {
  constructor(options) {
    this.options = options;
  }
}
