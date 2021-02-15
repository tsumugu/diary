<template>
  <div class="useranalyze">
    <modal class="useranalyze__modal" name="modal-timeline" :clickToClose="true" height="95%">
      <div class="useranalyze__modal__contents">
        <div style="padding:20px 20px 0 20px;height:40px;text-align:left;"><img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" v-on:click='()=>{this.$modal.hide("modal-timeline")}' class="icon_clickable" style="width:40px;height:40px;"></div>
        <div class="useranalyze__modal__contents__placeName">{{placeName}}</div>
        <TimeLine :propsPosts="postsList" :propsPostsOrderedbyDateList="postsOrderedbyDate" :propsParams="filteringParams" :propsIsOwner="isOwner" propsNotFoundMes="このリストに含まれている投稿はありません" @removepost='removepost'></TimeLine>
      </div>
    </modal>
    <div class="useranalyze__tag">
      <div class="useranalyze__tag__loader" v-show="isLoadingTagImg"><img src="/img/svg-loading-spinner.svg" class="useranalyze__tag__loader__img"></div>
      <img class="useranalyze__tag__img" :src="tagWordcloudUrl" v-on:load="()=>{if(this.loadingTagImgCount > 0){this.isLoadingTagImg = false;/*this.onSizeChange();*/} this.loadingTagImgCount+=1;}">
    </div>
    <div class="useranalyze__postlist useranalyze__margin" v-show="publicPostListsListDivided.count>0">
      <p class="useranalyze__postlist__title">投稿まとめ<img src="/img/edit-black-48dp/2x/outline_edit_black_48dp.png" class="editicon" v-on:click="gotoedit()" v-show="isOwner"></p>
      <div class="useranalyze__postlist__list">
        <!---->
        <UAPostListItem :propsItem="publicPostListsListDivided.first" @onClickPostList="onClickPostList" />
        <!---->
        <button v-show="publicPostListsListDivided.count>6" v-on:click="onClickMoreShowButton">もっと見る</button>
        <!---->
        <UAPostListItem v-show="isShowPostListSecondZone" :propsItem="publicPostListsListDivided.second" @onClickPostList="onClickPostList" />
        <!---->
      </div>
    </div>
    <div class="useranalyze__map useranalyze__margin" v-show="markers.length>0">
      <p class="useranalyze__map__title">マップ</p>
      <div id="map"></div>
    </div>
    <div class="useranalyze__friends useranalyze__margin" v-show="friendscountList.length>0&&isOwner">
      <p class="useranalyze__friends__title">フレンドランキング</p>
      <div v-for="(friend, index) in friendscountList"><small>No.{{index+1}}</small> {{friend.name}} ({{friend.count}}件)</div>
    </div>
    <div class="useranalyze__photos" v-show="imagesinpostListDisp.count>0">
      <p class="useranalyze__photos__title">写真</p>
      <div>
        <SquareImageViewer :propsSrc="src" :propsKey="key" v-for="(src,key) in imagesinpostListDisp.all" @onClick="onClickImage" style="cursor: pointer;"></SquareImageViewer>
      </div>
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
import SquareImageViewer from '@/components/SquareImageViewer.vue'
import TimeLine from '@/components/TimeLine.vue'
import MyUtil from '../assets/MyUtil.js'

export default {
  name: "useranalyze",
  components: {
    UAPostListItem,
    SquareImageViewer,
    TimeLine
  },
  data() {
    return {
      userId: null,
      isOwner: false,
      PM: null,
      FM: null,
      PSM: null,
      map: null,
      markers: [],
      postsList: [],
      postsOrderedbyDate: [],
      publicPostListsList: [],
      publicPostListsListDivided: [],
      isShowPostListSecondZone: false,
      tagsinpostList: [],
      tagscountList: [],
      imagesinpostList: [],
      imagesinpostListDisp: [],
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
      loadingTagImgCount: 0,
      isMoreShowImg: false,
      filteringParams: null,
      placeName: null,
      tagLinkList: [],
      imgWidth: 0,
      imgHeight: 0
    }
  },
  watch: {
    publicPostListsList() {
      /*
        this.publicPostListsListのうち、最初の{splitNum}こだけを表示して、ぜんぶ見るボタンが押されたらすべて表示
        そのために{splitNum}個+残りという形の配列にする
      */
      this.publicPostListsListDivided = this.divideList(this.publicPostListsList)
    }
  },
  methods: {
    alert(mes) {
      alert(mes)
    },
    divideList(argList) {
      var splitNum = 6
      const range = (start, stop) => Array.from({ length: (stop - start) + 1}, (_, i) => start + i);
      if (argList.length > splitNum) {
        // 0~4, 5~(this.publicPostListsList.length-1)
        var retObj = {
          count: argList.length,
          first: [...Array(splitNum).keys()].map(n=>argList[n]),
          second: range(splitNum, argList.length-1).map(n=>argList[n]),
        }
        retObj["all"] = retObj.first.concat(retObj.second)
        return retObj
      } else {
        return {
          count: argList.length,
          first: argList,
          second: null,
          all: argList
        }
      }
    },
    onClickMoreShowButton(e) {
      e.target.style.display = "none"
      this.isShowPostListSecondZone = true
    },
    onClickPostList(list) {
      this.placeName = list.name
      this.filteringParams = list.parms
      this.$modal.show("modal-timeline")
    },
    onClickInfoWindow(placeId, name) {
      this.placeName = name
      this.filteringParams = {
        where: placeId
      }
      this.$modal.show("modal-timeline")
    },
    onClickImage(imgUrl) {
      this.placeName = null
      this.filteringParams = {
        imgUrl: imgUrl
      }
      this.$modal.show("modal-timeline")
    },
    gotoedit(postid) {
      window.open('https://diary.tsumugu2626.xyz/editpostlist')
    },
    removepost(postid) {
      new MyUtil().confirmExPromise("この投稿を本当に削除しますか?").then(() => {
        database.ref("posts/"+this.userId+"/"+postid).remove().then(()=>{
          alert('削除しました！')
        })
      })
    }
  },
  mounted() {
    this.userId = this.$route.params.userid
    var test = {uid: this.userId}
    this.PM = new PlacesManager(axios, database, {uid: this.userId})
    this.FM = new FriendsManager(axios, database, {uid: this.userId})
    this.PSM = new PostsManager(axios, database, {uid: this.userId}, this.PM, this.FM)

    firebase.auth().onAuthStateChanged(user => {
      if (user == null) {
        this.isOwner = false
      } else {
        this.isOwner = (user.uid==this.userId)
      }
    })
    // 投稿まとめを読み込み
    var postlistPromise = new Promise((resolve)=>{
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
          resolve(this.publicPostListsList)
        }
      })
    })
    // 投稿を取得
    var postPromise = new Promise((resolve)=>{
      this.PSM.fetchallposts().then((posts) => {
        resolve(posts)
      })
    })
    // Google Maps JavaScript APIを読み込み
    var googleMapsPromise = this.$loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCmhvC49uN8fqrGEVOeMwAX-IglON8rcsQ")
    // すべて揃ったら...
    Promise.all([postlistPromise, postPromise, googleMapsPromise]).then((values) => {
      var publicpostlist = values[0]
      var posts = values[1]
      this.PSM.makeArrayWithNames(posts).then((postswithname) => {
        this.postsList = postswithname
        this.postsOrderedbyDate = this.PSM.makeArrayOrderedbyDate(postswithname)
        // ownerはすべての投稿、その他はリストに含まれている投稿のみ
        if (this.isOwner) {
          filteredItems = postswithname
        } else {
          // リストに含まれている投稿のみ抽出
          var filteredItems = []
          publicpostlist.forEach(e => {
            filteredItems.push(new MyUtil().filteringPostsWithPrms(postswithname, e.parms))
          })
          filteredItems = new MyUtil().uniquePostArray(filteredItems.flat())
        }
        // タグ、画像、フレンド、ピンを配列に格納していく
        // タグ
        this.PSM.fetchalltags(null, filteredItems).then((tags) => {
          var tagUrlObj = {}
          Object.keys(tags).forEach(k => {
            var e = tags[k]
            tagUrlObj[e.name] = e.count
          })
          if (Object.keys(tagUrlObj).length > 0) {
            var tagUrlStr = JSON.stringify(tagUrlObj)
            var reqUrl = "https://tsumugu.tech/wordcloud/gen.php?uid="+this.userId+"&words="+encodeURI(tagUrlStr)
            console.log(reqUrl)
            axios.get(reqUrl).then((res)=>{
              this.tagWordcloudUrl = res.data.img_url
            }).catch((error)=>{
              console.log("WordCloud Error", error)
              alert("画像の生成で問題が発生しました")
            })
          } else {
            this.isLoadingTagImg = true
          }
        })
        // 画像
        Object.keys(this.postsOrderedbyDate).forEach(k => {
          Object.keys(this.postsOrderedbyDate[k]).forEach(i => {
            var postid = this.postsOrderedbyDate[k][i].postid
            if (filteredItems.filter(e=>e.postid==postid).length != 0) {
              var imgurls = this.postsOrderedbyDate[k][i].imgUrls
              if (imgurls!=null&&imgurls!=undefined) {
                this.imagesinpostList.push(imgurls)
              }
            }
          })
        })
        this.imagesinpostListDisp = this.divideList(this.imagesinpostList.flat())
        // mapを生成
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: this.defaultLocation,
          zoom: 6,
        })
        // ピン
        var pinPriomiseList = []
        filteredItems.map(e=>{
          var promise = new Promise(resolve=>{
            this.PM.placeidtolocation(e.where.placeId).then(res=>{
              if (res!=null && res!=undefined) {
                var name = e.where.name
                var placeid = e.where.placeId
                var lat = res.lat
                var lon = res.lon
                if (new MyUtil().isAllValueNotEmpty([name, placeid, lat, lon])) {
                  // そのpidの場所がすでに格納されていなかったら格納
                  if (!this.markers.map(e=>e.pid).includes(placeid)) {
                    var tmpInfo = {
                      position: {
                        lat: lat, 
                        lng: lon
                      },
                      name: name,
                      content: '<button id="infowindowbutton_'+placeid+'" style="margin:0; padding:0; background-color:transparent; border:none; font-size:1rem;">'+name+'</button>',
                      pid: placeid
                    }
                    var marker = new google.maps.Marker(tmpInfo)
                    marker.addListener("click", () => {
                      this.onClickInfoWindow(tmpInfo.pid, tmpInfo.name)
                      var infoWindow = new google.maps.InfoWindow(tmpInfo)
                      infoWindow.open(this.map, marker)
                    })
                    this.markers.push(marker)
                  }
                }
              }
              resolve(true)
            })
          })
          pinPriomiseList.push(promise)
        })
        // 処理がすべて完了したらMarkerClustererに渡して表示
        Promise.all(pinPriomiseList).then((debug) => {
          const markerClusterer = new MarkerClusterer(this.map, this.markers, {
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
          })
          const styles = markerClusterer.getStyles();
          for (let i=0; i<styles.length; i++) {
            styles[i].textSize = 14;
            // これがないとマーカーがずれる
            styles[i].backgroundPosition = "-1 0";
          }
        })
        //
      })
    })
    .catch(() => {
      // Failed to fetch script
      alert("処理に失敗しました")
    })
  }
}
</script>

<style scoped lang="scss">
$title-fontsize: 1.8rem;
.useranalyze {
  width: 100%;
  height: 100%;
  &__margin {
    margin: 30px 0 30px 0;
  }
  &__modal {
    &__contents {
      width: 100%;
      height: 100%;
      &__placeName {
        padding: 0 20px 0 20px;
        font-size: $title-fontsize;
      }
    }
  }
  &__map {
    &__title {
      margin:  0 0 0 0;
      font-size: $title-fontsize;
    }
  }
  &__postlist {
    &__title {
      display: flex;
      justify-content: center;
      align-items: center;
      margin:  0 0 0 0;
      font-size: $title-fontsize;
    }
    &__list {
      &__itemwrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  }
  &__tag {
    &__title {
      margin:  0 0 0 0;
      font-size: $title-fontsize;
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
    &__svg {
      position: absolute;
      /*
      border: 3px solid blue;
      background-color:red;
      */
    }
    &__img {
      width: 100%;
    }
  }
  &__photos {
    &__title {
      margin:  0 0 0 0;
      font-size: $title-fontsize;
    }
  }
  &__friends {
    &__title {
      margin: 0;
      font-size: $title-fontsize;
    }
  }
}
#map {
  height: 300px;
}
.editicon {
  width: $title-fontsize;
  height: $title-fontsize;
}
</style>