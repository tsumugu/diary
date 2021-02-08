<template>
  <div class="useranalyze">
    <div class="useranalyze__tag">
      <div class="useranalyze__tag__loader" v-show="isLoadingTagImg"><img src="/img/svg-loading-spinner.svg" class="useranalyze__tag__loader__img"></div>
      <img class="useranalyze__tag__img" :src="tagWordcloudUrl" v-on:load="()=>{if(this.loadingTagImgCount > 0){this.isLoadingTagImg = false;} this.loadingTagImgCount+=1;}">
    </div>
    <div class="useranalyze__postlist" v-show="publicPostListsListDivided.count>0">
      <p class="useranalyze__postlist__title">投稿まとめ</p>
      <div class="useranalyze__postlist__list">
        <!---->
        <UAPostListItem :propsItem="publicPostListsListDivided.first" @onClickPostList="onClickPostList" />
        <!---->
        <button v-show="publicPostListsListDivided.count>5" v-on:click="onClickMoreShowButton">もっと見る</button>
        <!---->
        <UAPostListItem v-show="isShowPostListSecondZone" :propsItem="publicPostListsListDivided.second" @onClickPostList="onClickPostList" />
        <!---->
      </div>
    </div>
    <div class="useranalyze__friends" v-show="friendscountList.length>0">
      <p class="useranalyze__friends__title">同行者ランキング</p>
      <div v-for="(friend, index) in friendscountList"><small>No.{{index+1}}</small> {{friend.name}} ({{friend.count}}件)</div>
    </div>
    <div class="useranalyze__map" v-show="markers.length>0">
      <p class="useranalyze__map__title">マップ</p>
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
import UAPostListItem from '@/components/UAPostListItem.vue'

export default {
  name: "useranalyze",
  components: {
    UAPostListItem
  },
  data() {
    return {
      userId: null,
      PM: null,
      FM: null,
      PSM: null,
      map: null,
      markers: [],
      postsList: [],
      publicPostListsList: [],
      publicPostListsListDivided: [],
      isShowPostListSecondZone: false,
      tagsinpostList: [],
      tagscountList: [],
      tagWordcloudUrl: "https://tsumugu.tech/wordcloud/notfound.png",
      friendsinpostList: [],
      friendscountList: [],
      infowindows: [],
      tagsWithFontsizeList: [],
      defaultLocation: {lat: 35.6895014, lng: 139.6917337},
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
      isLoadingTagImg: true,
      loadingTagImgCount: 0
    }
  },
  watch: {
    publicPostListsList() {
      var splitNum = 6
      /*
        this.publicPostListsListのうち、最初の{splitNum}こだけを表示して、ぜんぶ見るボタンが押されたらすべて表示
        そのために{splitNum}個+残りという形の配列にする
      */
      const range = (start, stop) => Array.from({ length: (stop - start) + 1}, (_, i) => start + i);
      if (this.publicPostListsList.length > splitNum) {
        // 0~4, 5~(this.publicPostListsList.length-1)
        this.publicPostListsListDivided = {
          count: this.publicPostListsList.length,
          first: [...Array(splitNum).keys()].map(n=>this.publicPostListsList[n]),
          second: range(splitNum, this.publicPostListsList.length-1).map(n=>this.publicPostListsList[n])
        }
      } else {
        this.publicPostListsListDivided = {
          count: this.publicPostListsList.length,
          first: this.publicPostListsList,
          second: null
        }
      }
    }
  },
  methods: {
    onClickMoreShowButton(e) {
      e.target.style.display = "none"
      this.isShowPostListSecondZone = true
    },
    onClickPostList(listid) {
      //this.$router.push({path: '/', query: { listid: listid}})
      let routeData = this.$router.resolve({path: '/', query: { listid: listid}})
      window.open(routeData.href, '_blank')
    },
    onClickInfoWindow(placeId) {
      //this.$router.push({path: '/', query: { placeid: placeId}})
      let routeData = this.$router.resolve({path: '/', query: {placeid: placeId}})
      window.open(routeData.href, '_blank')
    },
    genPins() {
      this.PM.fetchusersavedplaces().then((places)=>{
        if (places != null && places != undefined) {
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
                content: '<button id="infowindowbutton_'+placeid+'" style="margin:0; padding:0; background-color:transparent; border:none; font-size:1rem;">'+places[placeid].name+'</button>',
                pid: placeid
              }
              var marker = new google.maps.Marker(tmpInfo)
              marker.addListener("click", () => {
                var infoWindow = new google.maps.InfoWindow(tmpInfo)
                infoWindow.open(this.map, marker)
                infoWindow.addListener('domready', () => {
                  document.getElementById('infowindowbutton_'+infoWindow.pid).addEventListener('click', () => {
                    this.onClickInfoWindow(infoWindow.pid)
                  })
                })
              })
              this.markers.push(marker)
            }
          })
          // MarkerClustererに渡して表示
          const markerClusterer = new MarkerClusterer(this.map, this.markers, {
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
            //imagePath: "/img/markerclusterer/m"
          })
          const styles = markerClusterer.getStyles();
          for (let i=0; i<styles.length; i++) {
            styles[i].textSize = 14;
            // これがないとマーカーがずれる
            styles[i].backgroundPosition = "-1 0";
          }
        }
      })
    }
  },
  mounted() {
    this.userId = this.$route.params.userid
    var test = {uid: this.userId}
    this.PM = new PlacesManager(axios, database, {uid: this.userId})
    this.FM = new FriendsManager(axios, database, {uid: this.userId})
    this.PSM = new PostsManager(axios, database, {uid: this.userId}, this.PM, this.FM)
    this.PSM.fetchalltags().then((tags) => {
      var tagUrlObj = {}
      Object.keys(tags).forEach(k => {
        var e = tags[k]
        tagUrlObj[e.name] = e.count
      })
      if (Object.keys(tagUrlObj).length > 0) {
        var tagUrlStr = JSON.stringify(tagUrlObj)
        this.tagWordcloudUrl = "https://tsumugu.tech/wordcloud/gen.php?uid="+this.userId+"&words="+encodeURI(tagUrlStr)
      } else {
        this.isLoadingTagImg = true
      }
    })
    // リストを読み込み
    database.ref("postlist/"+this.userId).on('value', (snapshot) =>{
      var lists = snapshot.val()
      if (lists != null || lists != undefined) {
        this.publicPostListsList = Object.keys(lists).map(k=>{
          if (lists[k].status=="public") {
            var tmpList = lists[k]
            tmpList["listid"] = k
            return tmpList
          }
        }).filter(Boolean)
      }
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
      this.genPins()
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
  &__map {
    &__title {
      margin:  0 0 0 0;
      font-size: 1.5rem;
    }
  }
  &__postlist {
    &__title {
      margin:  0 0 0 0;
      font-size: 1.5rem;
    }
    &__list {
      &__itemwrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  }
  &__tag {
    display: relative;
    &__title {
      margin:  0 0 0 0;
      font-size: 1.5rem;
    }
    &__img {
      width: 100%;
    }
    &__loader {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      &__img {
        width: 100px;
        height: 100px;
      }
    }
  }
  &__friends {
    &__title {
      margin: 0;
      font-size: 1.5rem;
    }
  }
}
#map {
  height: 300px;
}
</style>