/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { MglMap, MglGeolocateControl } from 'vue-mapbox';
import Mapbox from 'mapbox-gl';
Vue.component('MglMap', MglMap);
Vue.component('MglMap', MglMap);
Vue.component('MglGeolocateControl', MglGeolocateControl);

Vue.prototype.$mapbox = Mapbox;
