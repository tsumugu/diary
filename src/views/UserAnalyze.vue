<template>
  <div class="useranalyze">
    <div class="useranalyze__map">
      <p class="useranalyze__map__title">行ったことがある場所</p>
      <div id="map"></div>
    </div>
    <div class="useranalyze__postlist">
      <p class="useranalyze__postlist__title">リスト</p>
      <div v-show="publicPostListsListDivided.count==0">リストはありません</div>
      <div class="useranalyze__postlist__list">
        <!---->
        <div class="useranalyze__postlist__list__itemwrapper" v-on:click="onClickPostList(list)" v-for="list in publicPostListsListDivided.first">
          <div class="useranalyze__postlist__list__itemwrapper__img" :style="'background-image: url('+list.thumbnail+')'"></div>
          <div class="useranalyze__postlist__list__itemwrapper__titlewrapper">
            <p class="useranalyze__postlist__list__itemwrapper__titlewrapper__title">{{list.name}}</p>
          </div>
        </div>
        <!---->
        <button v-show="publicPostListsListDivided.count>5" v-on:click="onClickMoreShowButton">もっと見る</button>
        <!---->
        <div class="useranalyze__postlist__list__itemwrapper" v-on:click="onClickPostList(list)" v-show="isShowPostListSecondZone" v-for="list in publicPostListsListDivided.second">
          <div class="useranalyze__postlist__list__itemwrapper__img" :style="'background-image: url('+list.thumbnail+')'"></div>
          <div class="useranalyze__postlist__list__itemwrapper__titlewrapper">
            <p class="useranalyze__postlist__list__itemwrapper__titlewrapper__title">{{list.name}}</p>
          </div>
        </div>
        <!---->
      </div>
    </div>
    <div class="useranalyze__tag">
      <p class="useranalyze__tag__title">タグランキング</p>
      <div v-show="tagscountList.length==0">タグが付けられた投稿はありません</div>
      <div v-for="(tag, index) in tagscountList"><small>No.{{index+1}}</small> #{{tag.name}} ({{tag.count}}件)</div>
    </div>
    <div class="useranalyze__friends">
      <p class="useranalyze__friends__title">同行者ランキング</p>
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
      postsList: [],
      publicPostListsList: [],
      publicPostListsListDivided: [],
      isShowPostListSecondZone: false,
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
  watch: {
    publicPostListsList() {
      /*
        this.publicPostListsListのうち、最初の5こだけを表示して、ぜんぶ見るボタンが押されたらすべて表示
        そのために5個+残りという形の配列にする
      */
      const range = (start, stop) => Array.from({ length: (stop - start) + 1}, (_, i) => start + i);
      if (this.publicPostListsList.length > 5) {
        // 0~4, 5~(this.publicPostListsList.length-1)
        this.publicPostListsListDivided = {
          count: this.publicPostListsList.length,
          first: [...Array(5).keys()].map(n=>this.publicPostListsList[n]),
          second: range(5, this.publicPostListsList.length-1).map(n=>this.publicPostListsList[n])
        }
      } else {
        this.publicPostListsListDivided = {
          count: this.publicPostListsList.length,
          first: this.publicPostListsList,
          second: null
        }
      }
      console.log(this.publicPostListsListDivided)
    }
  },
  methods: {
    onClickMoreShowButton(e) {
      e.target.style.display = "none"
      this.isShowPostListSecondZone = true
    },
    onClickPostList(list) {
      this.$router.push({path: '/', query: { listid: list.listid}})
    },
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
        this.postsList = postswithname
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
        // リストを読み込み
        database.ref("postlist/"+this.userId).on('value', (snapshot) =>{
          var lists = snapshot.val()
          this.publicPostListsList = Object.keys(lists).map(k=>{
            if (lists[k].status=="public") {
              var tmpList = lists[k]
              tmpList["listid"] = k
              return tmpList
            }
          }).filter(Boolean)
        })
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
      display:inline-block;
      &__itemwrapper {
        /*
        display: flex;
        flex-basis: auto;
        justify-content: left;
        align-items: center;
        align-content: center;
        */
        display: grid;
        grid-template-columns: 80px 1fr;
        margin: 5px;
        border: 1px solid $main-border;
        border-radius: 0.25rem;
        &:hover {
          cursor: pointer;
          opacity: 0.5;
        }
        &__titlewrapper {
          display: flex;
          align-items: center;
          margin: 10px;
          &__title {
            word-break: break-all;
          }
        }
        &__img {
          width: 80px;
          height: 80px;
          background-color: $main-mainarea-bg;
          background-position: center center;
          background-size: cover;
          border-radius: 0.25rem 0 0 0.25rem;
        }
      }
    }
  }
  &__tag {
    &__title {
      margin:  0 0 0 0;
      font-size: 1.5rem;
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