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

  // inBounds() は getNorthEast / getSouthWest、serializeBounds() は
  // getNorthWest / getSouthEast を使う。この4つを満たせば maplibre の実物は不要
  // （テストランナー非依存に保つため実物を持ち込まない）。
  getBounds() {
    return {
      getNorthEast: () => ({ lng: 130.8, lat: 32.7 }),
      getSouthWest: () => ({ lng: 130.6, lat: 32.5 }),
      getNorthWest: () => ({ lng: 130.6, lat: 32.7 }),
      getSouthEast: () => ({ lng: 130.8, lat: 32.5 }),
    };
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
