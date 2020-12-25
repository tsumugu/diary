<template>
  <div class="editevent">
    <div class="editevent__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="editevent__body" v-else>
      <div class="editevent__body__signined" v-if="isSignIn">
        <!-- form -->
        <div><input type="datetime-local" placeholder="日付" v-model="when" /></div>
        <hr>
        <div>
          <select v-model="where"><option disabled value="">場所</option><option v-for="(val, key) in placeList" v-bind:value="val.placeId">{{val.name}}</option></select>
          <div><button v-on:click="getNowPlaceByGPS">GPSから入力</button></div>
          <div>写真に埋め込まれている情報から入力(<label for="uploadexifimg">この画像もアップロードする</label><input type="checkbox" id="uploadexifimg" v-model="isUploadEXIFImg" checked>)<input type="file" ref="exifInput" @change="onEXIFFileChange" accept="image/*" /></div>
          <div><input type="text" v-model="whereAdd" /><button v-on:click="onAddWhereButton">+</button></div>
        </div>
        <hr>
        <div><select v-model="who"><option disabled value="">誰と行ったか</option><option v-for="(val, key) in friendsList" v-bind:value="val.friendsId">{{val.name}}</option></select><div><input type="text" v-model="whoAdd" /><button v-on:click="onAddWhoButton">+</button></div></div>
        <hr>
        <div><textarea placeholder="したこと" v-model="what" /></div>
        <hr>
        <div class="imgPreview">
          <img v-bind:src="src" v-bind:id="'prev-' + key" v-for="(src, key) in previewImageList" :key="key">
        </div>
        <div><input type="file" ref="imgInput" @change="onFileChange" accept="image/*" multiple /></div>
        <hr>
        <div><button v-on:click="onSubmit">投稿</button></div>
      </div>
    </div>
  </div>
</template>

<script>
import imageCompression from 'browser-image-compression'
import EXIF from 'exif-js'
import axios from 'axios'
import ProgressPromise from 'progress-promise'
import MyUtil from '../assets/MyUtil.js'
import ImgUploader from '../assets/ImgUploader.js'
import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import PostsManager from '../assets/PostsManager.js'
import firebase from 'firebase'
var database = firebase.database()

export default {
  name: "editevent",
  props: {
    propsPostId: null
  },
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      IU: null,
      PM: null,
      FM: null,
      PSM: null,
      uploadFiles: null,
      uploadFilesEXIF: null,
      exifSrc: null,
      isUploadEXIFImg: true,
      uploadPromiseList: [],
      previewImageList: [],
      submitImageUrlList: [],
      searchResultPlaceList: [],
      userAddedPlaceList: [],
      nearbyPlaceList: [],
      placeList: [],
      friendsList: [],
      whereAdd: null,
      whoAdd: null,
      when: null,
      where: null,
      who: null,
      what: null
    }
  },
  watch: {
    isSignIn(after, before) {
      if (before == null) {
        this.initMain()
      }
    },
    userAddedPlaceList() {
      this.onChangePlaceList()
    },
    searchResultPlaceList() {
      this.onChangePlaceList()
    },
    nearbyPlaceList() {
      this.onChangePlaceList()
    }
  },
  methods: {
    initMain() {

      this.IU = new ImgUploader(axios)
      this.PM = new PlacesManager(axios, database, this.userInfo)
      this.FM = new FriendsManager(axios, database, this.userInfo)
      this.PSM = new PostsManager(this.PM, this.FM)

      this.FM.fetchfriendsgroup().then((friedsgroupinfo) => {
        if (new MyUtil().isObjNotEmpty(friedsgroupinfo)) {
          this.friendsList.push({name: "-- Friends Groups --", friendsId: null})
          Object.keys(friedsgroupinfo).forEach(gid => {
            this.friendsList.push({
              "friendsId": "fg - "+gid,
              "name": friedsgroupinfo[gid].name
            })
          })
        }
      })

      this.FM.fetchsavedfriends().then((friedsinfo) => {
        if (new MyUtil().isObjNotEmpty(friedsinfo)) {
          this.friendsList.push({name: "-- Friends --", friendsId: null})
          Object.keys(friedsinfo).forEach(fid => {
            this.friendsList.push({
              "friendsId": fid,
              "name": friedsinfo[fid].name
            })
          })
        }
      })

      this.PM.fetchusersavedplaces().then((placesinfo) => {
        if (new MyUtil().isObjNotEmpty(placesinfo)) {
          this.userAddedPlaceList.push({name: "-- User Saved Place --", placeId: null})
          Object.keys(placesinfo).forEach(pid => {
            this.userAddedPlaceList.push({
              "placeId": pid,
              "name": placesinfo[pid].name
            })
          })
        }
      })

      if (this.propsPostId != undefined) {
        // editpostからのアクセス。
        this.fillAllFormsFromPostId(this.propsPostId)
      }
    },
    resetAll() {
      this.isUploadEXIFImg = true
      this.uploadPromiseList = []
      this.previewImageList = []
      this.submitImageUrlList = []
      this.searchResultPlaceList = []
      this.nearbyPlaceList = []
      this.friendsList = []
      this.userAddedPlaceList = []
      this.placeList = []
      this.postedItem = null
      this.uploadFiles = null
      this.uploadFilesEXIF = null
      this.exifSrc = null
      this.when = null
      this.where = null
      this.who = null
      this.what = null
      this.whereAdd = null
      this.whoAdd = null
      this.$refs.exifInput.value = ""
      this.$refs.imgInput.value = ""

      this.initMain()
    },
    fillAllFormsFromPostId(postid) {
      firebase.database().ref("posts/"+this.userInfo.uid+"/"+postid).on('value', (snapshot) =>{
        var tlitem = snapshot.val()
        if (tlitem != null) {
          this.postedItem = tlitem
          this.postItem = tlitem
          this.when = tlitem.when
          this.what = tlitem.what
          this.previewImageList = tlitem.imgUrls
          this.where = tlitem.where
          this.who = tlitem.who
        } else {
          alert("投稿が存在しないようです。")
        }
      })
    },
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      this.uploadFiles = files
      Array.from(files).forEach(file => {
        this.createPreviewImage(file)
      })
      //this.createPreviewImage(files)
    },
    onChangePlaceList() {
      this.placeList = []
      var concat1 = this.searchResultPlaceList.concat(this.nearbyPlaceList)
      this.placeList = this.userAddedPlaceList.concat(concat1)
    },
    createPreviewImage(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.previewImageList.push(e.target.result)
      }
      reader.readAsDataURL(file)
    },
    onAddWhereButton() {
      //this.whereAddで検索してみる
      this.PM.searchplacesbyname(this.whereAdd).then((response) => {
        // selectを更新
        this.searchResultPlaceList = []
        this.searchResultPlaceList.push({name: "-- New User Add --", placeId: null})
        this.searchResultPlaceList.push({name: this.whereAdd, placeId: "pid_"+new MyUtil().uniqueStr()})
        this.searchResultPlaceList.push({name: "-- Search Result --", placeId: null})
        response.data.forEach((place) => {
          this.searchResultPlaceList.push(place)
        })
      }).catch((error) => {
        console.log("Places Manager Error", error)
      })
    },
    onAddWhoButton() {
      this.FM.savemyfriend(this.whoAdd).then(() => {
        this.FM.fetchsavedfriends().then((friedsinfo) => {
          if (new MyUtil().isObjNotEmpty(friedsinfo)) {
            this.friendsList = []
            this.friendsList.push({name: "-- Friends --", friendsId: null})
            Object.keys(friedsinfo).forEach(fid => {
              this.friendsList.push({
                "friendsId": fid,
                "name": friedsinfo[fid].name
              })
            })
          }
        })
        alert("フレンドを追加しました！")
      })
      .catch((error) => {
        //onError
        console.log("Firebase Error", error)
      })
    },
    onSubmit() {
      // submit処理
      //必須項目のチェック
      if (new MyUtil().isAllValueNotEmpty([this.when, this.where, this.what])) {
        // 画像をアップロードする
        if (this.uploadFiles != null) {
          Array.from(this.uploadFiles).forEach(file => {
            this.uploadPromiseList.push(new ProgressPromise((resolve, reject, progress)=>{
              imageCompression(file, {maxSizeMB:1}).then((compressedImg)=>{
                const data = new FormData();
                data.append('photo', compressedImg, compressedImg.name)
                this.IU.upload(data).then(res => resolve(res)).catch(err => reject(err))
                //.progress(res => progress(res))
              })
            }))
          })
        }
        //アップロードするにチェックがついていたらアップロード
        if (this.isUploadEXIFImg) {
          if (this.uploadFilesEXIF != null) {
            this.uploadPromiseList.push(new ProgressPromise((resolve, reject, progress)=>{
              imageCompression(this.uploadFilesEXIF, {maxSizeMB:1}).then((compressedImg)=>{
                const data = new FormData();
                data.append('photo', compressedImg, compressedImg.name)
                this.IU.upload(data).then(res => resolve(res)).catch(err => reject(err))
                //.progress(res => progress(res))
              })
            }))
          }
        }
        console.log(this.uploadPromiseList)
        // this.uploadPromiseListが空だとProgressPromise.allが実行されないので適当に空Promiseを追加
        if (this.uploadPromiseList.length == 0) {
          this.uploadPromiseList.push(new ProgressPromise((resolve)=>{resolve()}))
          this.submitImageUrlList = this.previewImageList
        }
        // 2. アップロードが完了したらすべての情報を合わせてRealtimeDBにset
        ProgressPromise.all(this.uploadPromiseList)
        .progress(results => console.log('Img Upload is in Progress', Math.round(results.proportion*100*10)/10)+"%")
        .then((ImageUrls) => {
          //APIから帰ってきたJSONをパースして、URLを配列にまとめる
          if (ImageUrls != undefined) {
            ImageUrls.forEach((json) => {
              if (json != null) {
                this.submitImageUrlList.push(json.data.url)
              }
            })
          }
          var UserPostInfoObj = {
            when: this.when,
            where: this.where,
            who: this.who,
            what: this.what,
            imgUrls: this.submitImageUrlList
          }
          console.log(UserPostInfoObj)
          //DBに保存
          if (this.postedItem != null) {
            // Update処理
            this.updateFirebaseRealtimeDB(UserPostInfoObj, this.propsPostId)
          } else {
            this.setFirebaseRealtimeDB(UserPostInfoObj)
          }
        })
      } else {
        alert("when, where, whatは必須項目です")
      }
    },
    setFirebaseRealtimeDB(Obj) {
      // placeIdから名前を取得
      var placeName = null
      Object.keys(this.placeList).forEach(k => {
        if (this.placeList[k].placeId == Obj.where) {
          placeName = this.placeList[k].name
          return true;
        }
      })
      // placeIdと名前を保存(同名で上書きされるので存在確認はしない)
      this.PM.savemyplace(Obj.where, placeName).then(() => {
        //
        firebase.database().ref("posts/"+this.userInfo.uid).push(Obj).then(() => {
          alert("投稿しました！")
          this.resetAll()
        })
        .catch((error) => {
          //onError
          console.log("Firebase Error", error)
          alert("投稿に失敗しました")
        })
        //
      })
      .catch((error) => {
        console.log("Firebase Error", error)
      })
    },
    updateFirebaseRealtimeDB(Obj, postid) {
      var diffObjs = new MyUtil().getDiffBetweenTwoObjects(this.postedItem, Obj)
      firebase.database().ref("posts/"+this.userInfo.uid+"/"+postid).update(diffObjs).then(() => {
        alert("更新しました！")
      })
      .catch((error) => {
        //onError
        console.log("Firebase Error", error)
        alert("投稿に失敗しました")
      })
    },
    onEXIFFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      this.uploadFilesEXIF = files[0]
      this.getEXIFinfo(this.uploadFilesEXIF)
    },
    getEXIFinfo(elm) {
      var _this = this
      EXIF.getData(elm, function() {
        var timestamp = EXIF.getTag(this, "DateTimeOriginal")
        if (timestamp != undefined) {
          var tmpTimestampSplited = timestamp.split(" ")
          var tmpTimestampMsSplited = tmpTimestampSplited[1].split(":")
          var timestampFormated = tmpTimestampSplited[0].replaceAll(":", "-")+"T"+tmpTimestampMsSplited[0]+":"+tmpTimestampMsSplited[1] 
        }
        var GPSLatitudeSixty = EXIF.getTag(this, "GPSLatitude")
        var GPSLongitudeSixty = EXIF.getTag(this, "GPSLongitude")
        if (GPSLatitudeSixty!=undefined && GPSLongitudeSixty!=undefined) {
          var GPSLatitudeTen = new MyUtil().latlonSixtyToTen(GPSLatitudeSixty[0], GPSLatitudeSixty[1], GPSLatitudeSixty[2])
          var GPSLongitudeTen = new MyUtil().latlonSixtyToTen(GPSLongitudeSixty[0], GPSLongitudeSixty[1], GPSLongitudeSixty[2])
        }
        var InfoFromEXIF = {
          date: timestampFormated,
          latitude: GPSLatitudeTen,
          longitude: GPSLongitudeTen
        }
        _this.setFormFromEXIFinfo(InfoFromEXIF)
      })
    },
    setFormFromEXIFinfo(InfoFromEXIF) {
      console.log(InfoFromEXIF)
      if (InfoFromEXIF.date != undefined) {
        this.when = InfoFromEXIF.date
      }
      if (InfoFromEXIF.latitude != undefined && InfoFromEXIF.longitude != undefined) {
        this.PM.searchnearbyplacesbylatlon(InfoFromEXIF.latitude, InfoFromEXIF.longitude).then((response) => {
          // selectを更新
          this.nearbyPlaceList = []
          this.nearbyPlaceList.push({name: "-- EXIF Result --", placeId: null})
          response.data.forEach((place) => {
            this.nearbyPlaceList.push(place)
          })
        }).catch((error) => {
          console.log("Places Manager Error", error)
        })
      } else {
        alert("位置情報が埋め込まれていないようです...")
      }
    },
    getNowPlaceByGPS() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { 
          var data = position.coords
	        var lat = data.latitude
	        var lon = data.longitude
          // "-33.8670522", "151.1957362"
          // 取得した現在地をもとに近辺のランドマークを取得
          this.PM.searchnearbyplacesbylatlon(lat, lon).then((response) => {
            // selectを更新
            this.nearbyPlaceList = []
            this.nearbyPlaceList.push({name: "-- GPS Result --", placeId: null})
            response.data.forEach((place) => {
              this.nearbyPlaceList.push(place)
            })
          }).catch((error) => {
            console.log("Places Manager Error", error)
          })
        }, (error) => { console.log("GeoLocation API Error", error) })
      } else {
        // 端末がGeoLocation APIに非対応だった場合
        // 最近の場所を適当に表示
      }
    }
  },
  mounted() {
    const _this = this

    firebase.auth().onAuthStateChanged(user => {
      _this.isSignIn = (user != null)
      _this.userInfo = user
      _this.isNowLoading = false
    })

  }
}
</script>

<style scoped lang="scss">
.editevent {
  width: 100%;
  height: 100%;
  &__loading {
    width: 100%;
    height: 100%;
  }
  &__body {
    width: 100%;
    height: 100%;
    &__signined {
      width: 100%;
      height: 100%;
    }
  }
}
.imgPreview > img {
  width: 100px;
}
</style>