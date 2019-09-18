<template lang="pug">
  client-only
    div
      MglMap(access-token='pk.eyJ1IjoibWlra2FtZSIsImEiOiJjamtpNnczNTQxMXJuM3FtbHl1a3dyMmgxIn0.d4Xr7p5rC24rYg4pFVWwqg', map-style='mapbox://styles/mapbox/streets-v11')
        MglGeolocateControl

</template>

<script lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'

function loadKMLData(data:Document){
    let that = this;
    let folders:HTMLCollectionOf<Element> = data.getElementsByTagName('Folder');
    if (folders.length == 0) {
        folders = data.getElementsByTagName('Document');
    }
    Array.prototype.forEach.call(folders, (folder) => {
        let category:Category = readCategoryOfFolder(folder, data);
        // convret category style if layer_settings option is set
        if (this.layer_settings){
            category = this.convertCategoryStyle(category);
        }
        if (tj.kml(folder).type == "FeatureCollection"){
            let geojsondata:geoJson.FeatureCollection = tj.kml(folder,{ styles: true });
            if (geojsondata.features.length > 0){
                that.addFeatureCollection(geojsondata, category);
            }
        }else{
            let geojsondata:geoJson.Feature　= tj.kml(folder,{ styles: true });
            that.addMarker(geojsondata, category);
        }
    });
}
export default {
  props: ['map_config'],
  data () {
    return {
      data:
    }
  },
  mounted () {
    console.log(this.map_config,this)
    $nuxt.$axios.$get(this.map_config.data_url).then((data) => {
      this.data = data;
    })
  }
}
</script>
