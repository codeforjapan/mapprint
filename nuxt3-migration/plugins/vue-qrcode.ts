// Plugin for Vue QR Code component
import VueQrcode from '@chenfengyuan/vue-qrcode';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('vue-qrcode', VueQrcode);
});