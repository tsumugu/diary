<template>
  <div class="useranalyze">
    <modal class="useranalyze__modal" name="modal-timeline" :clickToClose="true" height="95%">
      <div class="useranalyze__modal__contents">
        <div class="useranalyze__modal__contents__placeName">{{placeName}}</div>
        <TimeLine :propsPosts="postsList" :propsPostsOrderedbyDateList="postsOrderedbyDate" :propsParams="filteringParams" :propsIsOwner="isOwner" propsNotFoundMes="このリストに含まれている投稿はありません" @removepost='removepost'></TimeLine>
      </div>
    </modal>
    <div class="useranalyze__tag">
      <div class="useranalyze__tag__loader" v-show="isLoadingTagImg"><img src="/img/svg-loading-spinner.svg" class="useranalyze__tag__loader__img"></div>
      <!--<img class="useranalyze__tag__svg" id="tagsvg" :src="tagWordcloudSVGUrl" v-on:load="onLoadSVG">-->
      <div class="useranalyze__tag__svg" ref="tagsvg" v-html="tagWordcloudSVGChange"></div>
      <img class="useranalyze__tag__img" ref="tagimg" :src="tagWordcloudUrl" v-on:load="()=>{if(this.loadingTagImgCount > 0){this.isLoadingTagImg = false;this.onSizeChange();} this.loadingTagImgCount+=1;}">
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
    <!--
    <div class="useranalyze__friends useranalyze__margin" v-show="friendscountList.length>0">
      <p class="useranalyze__friends__title">フレンドランキング</p>
      <div v-for="(friend, index) in friendscountList"><small>No.{{index+1}}</small> {{friend.name}} ({{friend.count}}件)</div>
    </div>
    -->
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
      tagWordcloudSVG: null,
      tagWordcloudSVGChange: null,
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
    },
    onSizeChange() {
      var img = this.$refs.tagimg
      var svg = this.$refs.tagsvg
      this.imgWidth = img.clientWidth
      this.imgHeight = img.clientHeight
      svg.style.width = this.imgWidth+"px"
      svg.style.height = this.imgHeight+"px"
      this.setSVGSize()
    },
    setSVGSize() {
      if (this.imgWidth!=0&&this.imgHeight!=0&&this.tagWordcloudSVG!=null) {
        //this.tagWordcloudSVGChange = this.genSVG(this.imgWidth, this.imgHeight).outerHTML
      }
    },
    genSVG(width, height) {
      const domParser = new DOMParser()
      const parsedSVGDoc = domParser.parseFromString(this.tagWordcloudSVG, 'image/svg+xml')
      const parsedSVG = parsedSVGDoc.childNodes[0]
      var elements = parsedSVG.getElementsByTagName("text")
      var diffWidth = 1280-this.imgWidth
      var diffHeight = 720-this.imgHeight

      let ns = "http://www.w3.org/2000/svg"
      let svg = document.createElementNS(ns, "svg")
      svg.setAttribute("width", width)
      svg.setAttribute("height", height)
      let rect = document.createElementNS(ns, "rect")
      rect.setAttribute("width", width)
      rect.setAttribute("height", height)
      rect.setAttribute("style", "fill:transparent;")
      svg.appendChild(rect)
      for (var i = 0; i<elements.length; i++) {
        let text = document.createElementNS(ns, "text")
        text.appendChild(document.createTextNode( elements[i].textContent))
        var attributes = elements[i].attributes
        for (var j = 0; j<attributes.length; j++) {
          var name = attributes[j].name
          var value = attributes[j].nodeValue
          if (name == "transform") {
            var obj = this.convertTransformtextToObj(value)
            var culcDiffObj = this.calculateTransformDiff(obj, this.imgWidth, this.imgHeight, diffWidth, diffHeight)
            value = this.convertObjToTransformtext(culcDiffObj)
          } else if (name == "font-size") {
            value = value*0.75
          }
          text.setAttributeNS(null, name, value)
        }
        //text.setAttribute("style", "transform: scale(1,1);")
        svg.appendChild(text)
      }
      return svg
    },
    convertTransformtextToObj(transformText) {
      var resObj = {}
      transformText.split(" ").forEach(e => {
        var title = e.split(",")[0].split("(")[0]
        if (e.split(",")[1] != undefined) {
          var x = e.split(",")[0].split("(")[1]
          var y = e.split(",")[1].replace(")", "")
          resObj[title] = {
            "x": x,
            "y": y
          }
        } else {
          var rotate = e.split(",")[0].split("(")[1].replace(")", "")
          resObj[title] = {
            "rotate": rotate
          }
        }
      })
      return resObj
    },
    convertObjToTransformtext(obj) {
      var resArray = []
      Object.keys(obj).forEach(k => {
        if (k == "translate") {
          resArray.push("translate("+obj[k].x+", "+obj[k].y+")")
        } else {
          resArray.push("rotate("+obj[k].rotate+")")
        }
      })
      return resArray.join(" ")
    },
    calculateTransformDiff(obj, width, height, diffWidth, diffHeight) {
      var halfwidth = width/2
      var halfheight = height/2
      var retObj = {}
      Object.keys(obj).forEach(k => {
        if (k == "translate") {
          var x = parseInt(obj[k].x)
          var y = parseInt(obj[k].y)
          var calculatedX = x-diffWidth
          var calculatedY = y-diffHeight
          if (calculatedX<halfwidth) {
            // 左半分
            calculatedX+=200
          } else if (calculatedX>halfwidth) {
            // 右半分
            calculatedX+=130
          }
          if (calculatedY<halfheight) {
            // 上半分
            calculatedY+=120
          } else if (calculatedY>halfheight) {
            // 下半分
            calculatedY+=100
          }
          retObj[k] = {
            "x": calculatedX,
            "y": calculatedY
          }
        } else {
          retObj[k] = {
           "rotate": obj[k].rotate
          }
        }
      })
      return retObj
    },
    /*
    getTextPos(svg) {
      //console.log(svg)
      const domParser = new DOMParser();
      const parsedSVGDoc = domParser.parseFromString(svg, 'image/svg+xml');
      const parsedSVG = parsedSVGDoc.childNodes[0];
      var elements = parsedSVG.getElementsByTagName("text")
      for (var i = 0; elements.length; i++) {
        var matrix = elements[i].transform.animVal[0].matrix
        this.tagLinkList.push({
          "text": elements[i].textContent,
          "x": matrix.e,
          "y": matrix.f,
          "style": "position:absolute;top:"+matrix.e+"px;left:"+matrix.f+"px;"
        })
        console.log(this.tagLinkList)
      }
    },
    */
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
                this.onClickInfoWindow(tmpInfo.pid, tmpInfo.name)
                var infoWindow = new google.maps.InfoWindow(tmpInfo)
                infoWindow.open(this.map, marker)
                /*
                infoWindow.addListener('domready', () => {
                  document.getElementById('infowindowbutton_'+infoWindow.pid).addEventListener('click', () => {
                    this.onClickInfoWindow(infoWindow.pid)
                  })
                })
                */
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

    firebase.auth().onAuthStateChanged(user => {
      if (user == null) {
        this.isOwner = false
      } else {
        this.isOwner = (user.uid==this.userId)
      }
    })

    //
    this.PSM.fetchalltags().then((tags) => {
      var tagUrlObj = {}
      Object.keys(tags).forEach(k => {
        var e = tags[k]
        tagUrlObj[e.name] = e.count
      })
      if (Object.keys(tagUrlObj).length > 0) {
        var tagUrlStr = JSON.stringify(tagUrlObj)
        axios.get("https://tsumugu.tech/wordcloud/gen.php?uid="+this.userId+"&words="+encodeURI(tagUrlStr)).then((res)=>{
          this.tagWordcloudUrl = res.data.img_url
          //this.tagWordcloudSVGUrl = res.data.svg_url
          axios.get(res.data.svg_url).then((res)=>{
            this.tagWordcloudSVG = res.data
            this.setSVGSize()
            //this.getTextPos(this.tagWordcloudSVGUrl)
          })
        }).catch((error)=>{
          console.log("WordCloud Error", error)
          alert("画像の生成で問題が発生しました")
        })
        //this.tagWordcloudUrl = "https://tsumugu.tech/wordcloud/gen.php?uid="+this.userId+"&words="+encodeURI(tagUrlStr)
      } else {
        this.isLoadingTagImg = true
      }
    })
    //フレンドのランキング作成
    this.PSM.fetchallposts().then((posts) => {
      this.PSM.makeArrayWithNames(posts).then((postswithname) => {
        this.postsList = postswithname
        //
        this.postsOrderedbyDate = this.PSM.makeArrayOrderedbyDate(postswithname)
        Object.keys(this.postsOrderedbyDate).forEach(k => {
          Object.keys(this.postsOrderedbyDate[k]).forEach(i => {
            //console.log(postsOrderedbyDate[k][i])
            var imgurls = this.postsOrderedbyDate[k][i].imgUrls
            if (imgurls!=null&&imgurls!=undefined) {
              this.imagesinpostList.push(imgurls)
            }
          })
        })
        this.imagesinpostListDisp = this.divideList(this.imagesinpostList.flat())
        //
        //
        postswithname.forEach(e => {
          /*
          if (e.imgUrls!=null&&e.imgUrls!=undefined) {
            this.imagesinpostList.push(e.imgUrls)
          }
          */
          if (e.who.friendId!="null"&&e.who.friendId!=null&&e.who.friendId!=undefined&&e.who.name!="null"&&e.who.name!=null&&e.who.name!=undefined) {
            this.friendsinpostList.push(e.who)
          }
        })
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
      })
    })
    // 投稿まとめを読み込み
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

    window.addEventListener('resize', this.onSizeChange, false)
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
        padding: 20px 20px 0 20px;
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