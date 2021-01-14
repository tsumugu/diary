<template>
  <div class="useranalyze">
    {{userId}}
    <div class="useranalyze__map">
      <div id="map"></div>
      <!--
      <GmapMap
        :center="defaultLocation"
        :zoom="6"
        style="width: 500px; height: 300px"
      >
        <GmapMarker
          :key="index"
          v-for="(m, index) in markers"
          :position="m.position"
          :clickable="true"
          :draggable="false"
          @click="onClickedPin(m)" />
        <GmapInfoWindow
          :key="index"
          v-for="(m, index) in markers"
          :position="m.position"
          :options="infoOptions" >
          {{m.name}}
        </GmapInfoWindow>
      </GmapMap>
      -->
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import MarkerClusterer from '@googlemaps/markerclustererplus'
import PlacesManager from '../assets/PlacesManager.js'

export default {
  name: "useranalyze",
  components: {
  },
  data() {
    return {
      userId: null,
      PM: null,
      map: null,
      markers: [],
      infowindows: [],
      defaultLocation: {lat: 35.6895014, lng: 139.6917337},
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
    }
  },
  methods: {
    onClickedPin(e) {
      console.log(e)
    }
  },
  mounted() {
    this.userId = this.$route.params.userid
    var test = {uid: this.userId}
    this.PM = new PlacesManager(axios, database, {uid: this.userId})
    this.$loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCmhvC49uN8fqrGEVOeMwAX-IglON8rcsQ")
    .then(() => {
      // mapを生成
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: this.defaultLocation,
        zoom: 6,
      })
      // ピンを生成
      this.PM.fetchusersavedplaces().then((places)=>{
        // google.maps.Markerを生成
        this.markers = []
        Object.keys(places).forEach(placeid => {
          if (places[placeid].lat != undefined && places[placeid].lon != undefined) {
            var tmpInfo = {
              position: {
                lat: places[placeid].lat, 
                lng: places[placeid].lon
              },
              name: places[placeid].name,
              content: places[placeid].name,
              pid: placeid
            }
            var marker = new google.maps.Marker(tmpInfo)
            marker.addListener("click", () => {
              new google.maps.InfoWindow(tmpInfo).open(this.map, marker)
            })
            this.markers.push(marker)
          }
        })
        /*
        this.markers = Object.keys(places).map(placeid => {
          if (places[placeid].lat != undefined && places[placeid].lon != undefined) {
            return new google.maps.Marker({
              position: {
                lat: places[placeid].lat, 
                lng: places[placeid].lon
              },
              name: places[placeid].name,
              pid: placeid
            })
          }
        }).filter(Boolean)
        */
        // MarkerClustererに渡して表示
        new MarkerClusterer(this.map, this.markers, {imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"})
      })
      //
    })
    .catch(() => {
      // Failed to fetch script
      alert("マップの読み込みに失敗しました")
    })
  }
}
</script>

<style scoped lang="scss">
.useranalyze {
  width: 100%;
  height: 100%;
}
#map {
  width: 500px;
  height: 300px;
}
</style>