<template lang="pug">
div
  client-only
    div(v-if='layers.length')
      .map-outer
        #map(ref="map_container")
        //- maplibre の Marker / Popup に渡す DOM は Vue 側で描画しておく。
        //- 元の要素をそのまま渡すと Vue の管理下から DOM が移動して patch が壊れるため、
        //- 地図へ渡すのは複製（cloneNode）にする。装飾のロジックはここに残す。
        .marker-sources(v-show="false")
          div(v-for="(marker, index) in inBoundsMarkers" :key="markerKey(marker)")
            div.marker(ref="markerEls")
              span(
                :style="{background:mapConfig.layer_settings[marker.category]?.color||marker.feature.properties['marker-color']||'red'}"
                :class="{show: isDisplayAllCategory || activeCategory === marker.category}"
              )
                i(
                  :class="[mapConfig.layer_settings[marker.category]?.icon_class, mapConfig.layer_settings[marker.category]?.class]"
                  :style="{backgroundColor:mapConfig.layer_settings[marker.category]?.color, display:mapConfig.layer_settings[marker.category]?'inline':'none'}"
                )
                b.number(
                  :style="{background:mapConfig.layer_settings[marker.category]?.bg_color}"
                ) {{index + 1}}
            div(ref="popupEls")
              div.popup-type
                i(
                  :class="[mapConfig.layer_settings[marker.category]?.icon_class, mapConfig.layer_settings[marker.category]?.class]"
                  :style="{backgroundColor:mapConfig.layer_settings[marker.category]?.color}"
                )
                span.popup-poi-type
                  | {{getMarkerCategoryText(mapConfig.layer_settings[marker.category]?.name||marker.category, locale)}}
              p
                | {{$t("PrintableMap.name")}} {{getMarkerNameText(marker.feature.properties, locale)}}
              div.popup-detail-content
                p(
                  v-html="marker.feature.properties.description ? marker.feature.properties.description : ''"
                )
      .legend-navi
        .area-select(:class='{open: isOpenAreaSelect}')
          .area-close(@click="isOpenAreaSelect=false")
            | {{$t("PrintableMap.close_area_select")}}
            i.fas.fa-arrow-down
          .area-list-outer(:class='{open: isOpenAreaSelect}')
            ul.area-list.grid
              li.area-item.col-12_xs-6(v-for='source in mapConfig.sources')
                label.area-label
                  input.area-input(
                    type='checkbox'
                    :value='source.title'
                    v-model='selectArea'
                  )
                  | {{source.title}}
                  span
                    | {{source.updated_at}}
                  a(
                    v-if='source.link'
                    :href='source.link'
                    target='blank'
                  ) [{{$t("PrintableMap.back_to_map")}}]
        .navigation
          .navigation-area.print-exclude
            .legend-navi-icon.active
              .legend-navi-button.print-button(@click="clickPrintButton()")
                span.fa.fa-print(:alt='$t("PrintableMap.print")')
          .navigation-area
            .area-select-button(@click="isOpenAreaSelect=!isOpenAreaSelect")
              .area-array-outer
                i.fas.fa-check-square
                .area-array
                  | {{checkedArea.join(', ')}}
              .area-select-button-icon.print-exclude
                i.fas.fa-arrow-up
          .navigation-legend.legend-navi-inner.print-exclude
            .legend-navi-icon
              img(
                :src='legendMark'
                width="60" height="60"
                :alt='$t("PrintableMap.legend")'
              )
            .legend-list-outer
              simplebar(data-simplebar-auto-hide="false")
                ul.legend-list
                  li.legend-item(
                    v-for='({ category, setting }) in visibleLegendEntries'
                    :key='category'
                  )
                    span.legend-mark(
                      :style="{backgroundColor:setting.color}"
                      @click="selectCategory(category), isOpenList=category, isDisplayAllCategory=false"
                      :class='{open: isDisplayAllCategory || activeCategory === category}'
                    )
                      i(:class="[setting.icon_class]")
            .legend-navi-icon(
              @click="selectCategory(''), isDisplayAllCategory=true, isOpenList=true"
              :class='{active: activeCategory}'
            )
              .legend-navi-button
                img.legend-navi-img(
                  :src='legendActive'
                  width="40" height="40"
                  :alt='$t("PrintableMap.show_all")'
                )
        .list-outer(:class='{open: isOpenList}')
          section.list-section(
            v-for='group in displayMarkersGroupByCategory'
            :class='{show: isDisplayAllCategory || activeCategory === getMarkerCategoryText(group.category, locale)}'
          )
            h2.list-title(
              :style="{backgroundColor:mapConfig.layer_settings[group.category]?.color||group.markers[0]?.feature?.properties['marker-color']||'darkgreen'}"
            ) 
              span.list-title-mark
                i(
                  :class="mapConfig.layer_settings[group.category]?.icon_class"
                )
              span {{getMarkerCategoryText(mapConfig.layer_settings[group.category]?.name||group.category, locale)}}
            ul.list-items.grid-noGutter
              li.col-12_xs-6(v-for="marker in group.markers")
                span.item-number {{inBoundsMarkers.indexOf(marker) +1}}
                span.item-name {{getMarkerNameText(marker.feature.properties, locale)}}
          .list-section-none(
            v-if="isDisplayAllCategory && displayMarkersGroupByCategory.length === 0"
          )
            p
              | {{$t("PrintableMap.no_point_in_map")}}
      .legend-close.print-exclude(
        :class='{open: isOpenList}'
        @click="isOpenList=false"
      )
        | {{$t("PrintableMap.close_list")}}
        i.fas.fa-arrow-down
</template>

<script lang="js">
import "maplibre-gl/dist/maplibre-gl.css";
import "simplebar-vue/dist/simplebar.min.css";
import MapLibre from "maplibre-gl";
import ky from "ky";
// js-crc は CommonJS なので named import は SSR で解決できない
import jsCrc from "js-crc";
import { getNowYMD } from "~/lib/displayHelper";
import MapHelper from "~/lib/MapHelper";
// Vite では require が使えないため、ロケール別の画像は静的に import する
import fukidashiJa from "~/assets/images/fukidashi_obj_ja.svg";
import fukidashiEn from "~/assets/images/fukidashi_obj_en.svg";
import activeTxtJa from "~/assets/images/active_txt_ja.svg";
import activeTxtEn from "~/assets/images/active_txt_en.svg";

const FUKIDASHI = { ja: fukidashiJa, en: fukidashiEn };
const ACTIVE_TXT = { ja: activeTxtJa, en: activeTxtEn };

const { crc16 } = jsCrc;

let helper;
export default {
  props: {
    mapConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    let locale = "en";
    if (this.locale === "ja") {
      locale = "ja";
    }
    return {
      // maplibre の Map と Marker は data に置かない。Vue 2 が深くリアクティブ化して
      // WebGL 由来のオブジェクトを走査してしまうため、created で非リアクティブに持つ。
      layers: [],
      bounds: null,
      updated_at: null,
      previous_hash: "",
      activeCategory: "",
      checkedArea: [],
      isOpenAreaSelect: false,
      isOpenList: false,
      isDisplayAllCategory: true,
      mapStyle: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json",
      legendMark: FUKIDASHI[locale],
      legendActive: ACTIVE_TXT[locale],
    };
  },
  computed: {
    // vue-i18n 9 以降 $i18n.locale は ref なのでテンプレートから直接使えない。
    // ref でも素の値でも動くように unwrap した computed を用意する。
    locale() {
      const l = this.$i18n.locale;
      return l && typeof l === "object" && "value" in l ? l.value : l;
    },
    center() {
      return this.mapConfig.center;
    },

    setLayerSettings(name, color, bg_color, icon_class) {
      const newConfig = this.mapConfig;
      newConfig.layer_settings[name] = {
        color,
        bg_color
      };
      if (icon_class) {
        newConfig.layer_settings[name].icon_class = icon_class;
    
      }
      this.$emit("update:mapConfig", newConfig);
      return newConfig;
    },
    inBoundsMarkers() {
      const inBoundsMarkers = this.layers
        .filter(l => l.source.show && this.checkedArea.includes(l.source.title))
        .map(l => l.markers).flat()
        .filter((marker) => {
          if (!this.bounds) return true;
          return helper.inBounds(marker.feature.geometry.coordinates, this.bounds);
        });
      return inBoundsMarkers;
    },
    // Vue 3 では同一要素の v-for と v-if を併用できない（v-if が先に評価される）。
    // 表示対象のカテゴリだけを先に配列にしておく。
    visibleLegendEntries() {
      const settings = this.mapConfig.layer_settings || {};
      return Object.keys(settings)
        .filter((category) =>
          this.displayMarkersGroupByCategory.some((elm) => elm.category === category)
        )
        .map((category) => ({ category, setting: settings[category] }));
    },
    displayMarkersGroupByCategory() {
      const resultGroupBy = this.inBoundsMarkers.reduce((groups, current) => {
        let group = groups.find((g) => g.category === current.category);
        if (!group) {
          group = {
            category: current.category,
            prop: current.category,
            markers: [],
          };
          groups.push(group);
        }
        group.markers.push(current);
        return groups;
      }, []);
      return resultGroupBy;
    },
    selectArea: {
      get() {
        return this.checkedArea;
      },
      set(value) {
        this.checkedArea = value;
      },
    },
  },
  created() {
    // 非リアクティブに保持する。key は markerKey()、値は MapLibre.Marker。
    this.map = null;
    this.markerCache = {};
  },
  watch: {
    // Vue 3 では配列への push は親プロパティの watcher を発火させないため deep が必要。
    // Vue 2 は配列メソッドを介入していたので不要だった。
    layers: {
      deep: true,
      handler() {
        if (this.layers.length && !this.map) {
          this.$nextTick(this.initMap);
        }
      },
    },
    inBoundsMarkers() {
      this.$nextTick(this.syncMarkers);
    },
    // 凡例のカテゴリ選択はマーカーの見た目（show クラス）を変える。
    // 複製を地図に渡しているので作り直す。クリック起点なのでちらつきは問題にならない。
    activeCategory() {
      this.$nextTick(this.rebuildMarkers);
    },
    isDisplayAllCategory() {
      this.$nextTick(this.rebuildMarkers);
    },
  },
  beforeUnmount() {
    Object.keys(this.markerCache).forEach((key) => {
      this.markerCache[key].remove();
      delete this.markerCache[key];
    });
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  mounted() {
    helper = new MapHelper();
    const area = [];
    const categories = {};
    const self = this;
    this.mapConfig.sources.forEach((source) => {
      (async () => {
        if (source.show) {
          area.push(source.title);
        }
        self.checkedArea = area;
        self.updated_at = getNowYMD(new Date());
        const data = await ky.get(source.url).text();
        const [markers, updated_at] = helper.parse(
          source.type,
          data,
          self.mapConfig.layer_settings,
          source.updated_search_key
        );
        // eslint-disable-next-line array-callback-return
        markers.map((marker) => {
          categories[marker.category] = true;
        });
        source.updated_at = updated_at;
        // eslint-disable-next-line array-callback-return
        Object.keys(categories).map((category) => {
          const categoryExists = self.mapConfig.layer_settings[category];

          if (!categoryExists) {
            let color = "#";
            color += ((parseInt(crc16(category.substr(0)), 16) % 32) + 64).toString(16);
            color += ((parseInt(crc16(category.substr(1)), 16) % 32) + 64).toString(16);
            color += ((parseInt(crc16(category.substr(2)), 16) % 32) + 64).toString(16);

            let bg_color = "#";
            bg_color += ((parseInt(crc16(category.substr(0)), 16) % 32) + 128).toString(16);
            bg_color += ((parseInt(crc16(category.substr(1)), 16) % 32) + 128).toString(16);
            bg_color += ((parseInt(crc16(category.substr(2)), 16) % 32) + 128).toString(16);
            this.$emit('setLayerSettings', {
              name: category,
              color,
              bg_color,
            })
          }
        });
        self.layers.push({
          source,
          markers,
        });
      })();
    });
  },
  methods: {
    // 地図コンテナは template の v-if='layers.length' の内側にあるため、
    // mounted の時点では存在しない。layers が埋まってから呼ばれる。
    initMap() {
      const container = this.$refs.map_container;
      if (!container || this.map) {
        return;
      }
      this.map = new MapLibre.Map({
        container,
        style: this.mapStyle,
        center: this.center,
        zoom: 15,
        // 印刷時に canvas を読み戻すため必須。落とすと画面では正常に見えるのに
        // 印刷結果の地図が白くなる。
        preserveDrawingBuffer: true,
      });
      this.map.addControl(new MapLibre.NavigationControl());
      this.map.addControl(new MapLibre.GeolocateControl({ trackUserLocation: false }));
      this.load();
      this.$nextTick(this.syncMarkers);
    },
    load() {
      const locationhash = window.location.hash.substr(1);
      let initbounds = helper.deserializeBounds(locationhash);
      if (initbounds !== undefined) {
        this.map.fitBounds(initbounds, { linear: false });
      } else {
        initbounds = helper.deserializeBounds(this.mapConfig.default_hash);
        if (initbounds !== undefined) {
          this.map.fitBounds(initbounds, { linear: false });
        }
      }
      this.map.on("moveend", this.etmitBounds);
      this.etmitBounds();
    },
    etmitBounds() {
      this.bounds = this.map.getBounds();
      this.setHash(this.bounds);
      this.$emit("bounds-changed");
    },
    // 座標・カテゴリ・名称で一意にする。地図移動のたびに全消しせず差分更新するための鍵。
    markerKey(marker) {
      const coordinates = marker.feature.geometry.coordinates.join(",");
      const name = marker.feature.properties.name || "";
      return marker.category + "|" + coordinates + "|" + name;
    },
    syncMarkers() {
      if (!this.map) {
        return;
      }
      const markerEls = this.$refs.markerEls || [];
      const popupEls = this.$refs.popupEls || [];
      const wanted = {};
      this.inBoundsMarkers.forEach((marker, index) => {
        const key = this.markerKey(marker);
        wanted[key] = true;
        if (this.markerCache[key]) {
          return;
        }
        const markerEl = markerEls[index];
        if (!markerEl) {
          return;
        }
        const popup = new MapLibre.Popup({ offset: 12 });
        const popupEl = popupEls[index];
        if (popupEl) {
          popup.setDOMContent(popupEl.cloneNode(true));
        }
        this.markerCache[key] = new MapLibre.Marker({
          element: markerEl.cloneNode(true),
          anchor: "top-left",
        })
          .setLngLat(marker.feature.geometry.coordinates)
          .setPopup(popup)
          .addTo(this.map);
      });
      Object.keys(this.markerCache).forEach((key) => {
        if (!wanted[key]) {
          this.markerCache[key].remove();
          delete this.markerCache[key];
        }
      });
    },
    rebuildMarkers() {
      Object.keys(this.markerCache).forEach((key) => {
        this.markerCache[key].remove();
        delete this.markerCache[key];
      });
      this.syncMarkers();
    },
    setHash(bounds) {
      const s = helper.serializeBounds(bounds);
      const path = location.pathname;
      if (s !== this.previous_hash) {
        window.history.pushState("", "", path + "#" + s);
      }
      this.previous_hash = s;
    },
    selectCategory(category) {
      this.activeCategory = category;
    },
    clickPrintButton() {
      window.print();
    },
    getMarkerCategoryText(category, locale) {
      if (category === undefined) {
        category = "未分類";
      }
      const key = "category." + category;
      const categoryText = this.$t(key);
      if (categoryText !== key) {
        return categoryText;
      } else {
        return category;
      }
    },
    getMarkerNameText(markerProperties, locale) {
      let name = markerProperties.name;
      // eslint-disable-next-line no-prototype-builtins
      if (markerProperties.hasOwnProperty("name:" + locale)) {
        name = markerProperties["name:" + locale];
      }
      return name;
    },
  },
};
</script>
