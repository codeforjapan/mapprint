/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue'
import { MglMap, MglGeolocateControl, MglMarker, MglPopup } from 'vue-mapbox'
import Mapbox from 'mapbox-gl'
Vue.component('MglMap', MglMap)
Vue.component('MglMap', MglMap)
Vue.component('MglGeolocateControl', MglGeolocateControl)
Vue.component('MglMarker', MglMarker)
Vue.component('MglPopup', MglPopup)
Vue.prototype.$mapbox = Mapbox
