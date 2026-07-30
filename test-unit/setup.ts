// maplibre-gl は import 時点で window.URL.createObjectURL を参照するが、
// jsdom には実装がないため補う。WebGL を使う描画自体はテスト対象にしない。
if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => '';
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }
}
