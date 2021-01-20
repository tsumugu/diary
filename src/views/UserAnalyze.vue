<template>
  <div class="useranalyze">
    {{userId}}
    <div class="useranalyze__map">
      <div id="map"></div>
    </div>
    <div class="useranalyze__tag">
      <div v-show="tagscountList.length==0">タグが付けられた投稿はありません</div>
      <div v-for="(tag, index) in tagscountList"><small>No.{{index+1}}</small> #{{tag.name}} ({{tag.count}}件)</div>
    </div>
    <div class="useranalyze__friends">
      <div v-show="friendscountList.length==0">同行者の情報が付けられた投稿はありません</div>
      <div v-for="(friend, index) in friendscountList"><small>No.{{index+1}}</small> {{friend.name}} ({{friend.count}}件)</div>
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
      tagsinpostList: [],
      tagscountList: [],
      friendsinpostList: [],
      friendscountList: [],
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
        //それぞれ別の配列に格納
        postswithname.forEach(e => {
          if (e.who.friendId!=null&&e.who.friendId!=undefined&&e.who.name!=null&&e.who.name!=undefined) {
            this.friendsinpostList.push(e.who)
          }
          if (e.tags!=undefined) {
            this.tagsinpostList.push(e.tags)
          }
        })
        //タグをカウントしてランキングを作成 (もっと綺麗に書けそう)
        var tmpTagsCountList = []
        this.tagsinpostList.forEach(e=>{
          e.forEach(f=>{
            if (tmpTagsCountList[f] == undefined) {
              tmpTagsCountList[f] = 0
            }
            tmpTagsCountList[f] += 1
          })
        })
        this.tagscountList = []
        Object.keys(tmpTagsCountList).forEach(k => {
          this.tagscountList.push({
            name: k,
            count: tmpTagsCountList[k]
          })
        })
        this.tagscountList.sort(function(a, b) {
          if (a.count < b.count) {
            return 1
          } else {
            return -1
          }
        })
        if (this.tagscountList.length > 5) {
          this.tagscountList = this.tagscountList.splice(0, 5)
        }
        //フレンドのランキングも作成
        var tmpFriendsCountList = []
        this.friendsinpostList.forEach(e=>{
          if (tmpFriendsCountList[e.friendId] == undefined) {
            tmpFriendsCountList[e.friendId] = 0
          }
          tmpFriendsCountList[e.friendId] += 1
        })
        this.friendscountList = []
        Object.keys(tmpFriendsCountList).forEach(k => {
          this.FM.friendidtoname(k).then(name=>{
            this.friendscountList.push({
              friendid: k,
              name: name,
              count: tmpFriendsCountList[k]
            })
          })
        })
        this.friendscountList.sort(function(a, b) {
          if (a.count > b.count) {
            return 1
          } else {
            return -1
          }
        })
        if (this.friendscountList.length > 5) {
          this.friendscountList = this.friendscountList.splice(0, 5)
        }
        //
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