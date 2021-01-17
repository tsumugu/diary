<template>
  <div class="useranalyze">
    {{userId}}
    <div class="useranalyze__map">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import MarkerClusterer from '@googlemaps/markerclustererplus'
import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import PostsManager from '../assets/PostsManager.js'

export default {
  name: "useranalyze",
  components: {
  },
  data() {
    return {
      userId: null,
      PM: null,
      FM: null,
      PSM: null,
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
    this.FM = new FriendsManager(axios, database, {uid: this.userId})
    this.PSM = new PostsManager(axios, database, {uid: this.userId}, this.PM, this.FM)

    this.PSM.fetchallposts().then((posts) => {
      this.PSM.makeArrayWithNames(posts).then((postswithname) => {
        // アクティビティの統計を作成
        //console.log(postswithname)
        // friendsの統計を作成
        postswithname.forEach(e => {
          console.log(e.who)
        })
      })
    })

    // Google Maps JavaScript APIをロード
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