<template>
  <div class="editevent">
    <div class="editevent__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="editevent__body" v-else>
      <div class="editevent__body__signined" v-if="isSignIn">
        <modal class="editevent__modal" name="modal-loading" :clickToClose="false">
          <LoadingDialog propsMessage="test" :propsLoadingProgress=imgLoadingProgress />
        </modal>
        <!-- -->
        <div>日時: <DatePicker v-model="whenBeforeFormated" mode="dateTime" is24hr><template v-slot="{ inputValue, inputEvents }"><input :value="inputValue" v-on="inputEvents" /></template></DatePicker></div>
        <!-- -->
        <div>場所: {{whereName==null?"未入力":whereName}} <button v-on:click="showModal('modal-where')">選択</button></div>
        <modal class="editevent__modal" name="modal-where" :clickToClose="true" height="95%">
          <div class="editevent__modal__contents">
            <button v-on:click="hideModal('modal-where')">Close</button>
            <div><button v-on:click="searchNearbyPlaceByGPS">GPSを更新</button></div>
            <div><input type="text" v-model="whereAdd" @keyup.enter="onAddWhereButton" /></div>
            <ul>
              <li v-for="places in placeListDisp">
                <p>{{places.name}}</p>
                <ol>
                  <li v-for="item in places.items" :key="item.placeId">
                    <label><input type="radio" v-model="where" v-bind:value="item.placeId">{{item.name!=undefined?item.name:"- 名称未設定 -"}}{{item.location!=undefined?" ("+item.location+")":""}}</label>
                  </li>
                </ol>
              </li>
            </ul>
          </div>
        </modal>
        <!-- -->
        <div>誰と行ったか: {{whoName==null?"未入力":whoName}}<button v-on:click="showModal('modal-who')">選択</button></div>
        <modal class="editevent__modal" name="modal-who" :clickToClose="true" height="95%">
          <div class="editevent__modal__contents">
            <button v-on:click="hideModal('modal-who')">Close</button>
            <ul>
              <li v-for="friends in friendsList">
                <p>{{friends.name}}</p>
                <ol>
                  <li v-for="item in friends.items" :key="item.friendsId">
                    <label><input type="radio" v-model="who" v-bind:value="item.friendsId">{{item.name}}</label>
                  </li>
                </ol>
              </li>
            </ul>
            <div><input type="text" v-model="whoAdd" /><button v-on:click="onAddWhoButton">+</button></div>
          </div>
        </modal>
        <!-- -->
        <div><textarea placeholder="したこと" v-model="what" /></div>
        <!-- -->
        <div class="imgPreview">
          <div v-for="(src, key) in previewImageList">
            <button v-on:click="removeImgAtInput(src)">削除</button>
            <button v-on:click="getEXIFinfo('prev-' + key)">画像に埋め込まれているデータから日時と場所を入力</button>
            <img v-bind:src="src" v-bind:id="'prev-' + key" :key="key">
          </div>
        </div>
        <div><input type="file" ref="imgInput" @change="onFileChange" accept="image/*" multiple /></div>
        <!-- -->
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
import firebase from 'firebase'
var database = firebase.database()
import formatISO  from 'date-fns/formatISO'
import MyUtil from '../assets/MyUtil.js'
import ImgUploader from '../assets/ImgUploader.js'
import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import PostsManager from '../assets/PostsManager.js'
import LoadingDialog from '@/components/LoadingDialog.vue'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

export default {
  name: "editevent",
  components: {
    LoadingDialog,
    DatePicker
  },
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
      uploadPromiseList: [],
      previewImageList: [],
      submitImageUrlList: [],
      searchResultPlaceList: [],
      userAddedPlaceList: [],
      nearbyPlaceList: [],
      placeList: [],
      placeListDisp: [],
      friendsList: [],
      whereAdd: null,
      whoAdd: null,
      when: null,
      whenBeforeFormated: null,
      where: null,
      whereName: null,
      who: null,
      whoName: null,
      what: null,
      imgLoadingProgress: null,
      imageUploadCount: 0,
      failedImgDataList: [],
      filterDoTimer: null
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
    },
    whenBeforeFormated() {
      //whenBeforeFormated(new Date()) => when(ISO8601)
      this.when = formatISO(this.whenBeforeFormated).replace("+09:00", "")
    },
    placeList() {
      // placeListDispはリスト表示用のリスト
      this.placeListDisp = this.placeList
      // 再度フィルタリング
      this.filteringPlacesListFromSearchbox()
    },
    who() {
      var tmpName = null
      Object.keys(this.friendsList).forEach(k=>{
        this.friendsList[k].items.forEach(l=>{
          if (l.friendsId==this.who) {
            tmpName = l.name
          }
        })
      })
      if (tmpName != null) {
        this.whoName = tmpName
        //モーダルを閉じる
        this.hideModal("modal-who")
      }
    },
    where() {
      this.getWhereName().then((name)=>{
        this.whereName = name
        //モーダルを閉じる
        this.hideModal("modal-where")
      })
    },
    whereAdd() {
      this.filteringPlacesListFromSearchbox()
      // 一定間隔入力がなかったらEnterキーを押下したときと同じ処理を実行
      clearTimeout(this.filterDoTimer)
      this.filterDoTimer =  setTimeout(()=>{
        this.onAddWhereButton()
      }, 500)
    },
    uploadFiles() {
      // 新しいファイルが選択されたら自動的にサムネを表示
      //this.previewImageList = []
      Array.from(this.uploadFiles).forEach(file => {
        this.createPreviewImage(file, e => {
          this.previewImageList.push(e.target.result)
        })
      })
    }
  },
  methods: {
    initMain() {

      this.IU = new ImgUploader(axios)
      this.PM = new PlacesManager(axios, database, this.userInfo)
      this.FM = new FriendsManager(axios, database, this.userInfo)
      this.PSM = new PostsManager(axios, database, this.userInfo, this.PM, this.FM)

      this.loadFriends()

      this.PM.fetchusersavedplaces().then((placesinfo) => {
        if (new MyUtil().isObjNotEmpty(placesinfo)) {
          this.userAddedPlaceList = [{
            name: "-- User Saved Place --",
            items: Object.keys(placesinfo).filter(e=>e!="null"&&e!=null).map(pid => {
              return { "placeId": pid, "name": placesinfo[pid].name }
            })
          }]
          // 名前を更新する
          if (new MyUtil().isAllValueNotEmpty([this.where])) {
            this.getWhereName().then((name)=>{
              this.whereName = name
            })
          }
        }
      })

      if (this.propsPostId != undefined) {
        // editpostからのアクセス。
        this.fillAllFormsFromPostId(this.propsPostId)
      }

      this.whenBeforeFormated = new Date()
    },
    loadFriends() {
      this.friendsList = []
      this.FM.fetchfriendsgroup().then((friedsgroupinfo) => {
        if (new MyUtil().isObjNotEmpty(friedsgroupinfo)) {
          this.friendsList.push({
            name: "-- Friends Groups --",
            items: Object.keys(friedsgroupinfo).filter(e=>e!="null"&&e!=null).map(fid => {
              return { "friendsId": "fg - "+fid, "name": friedsgroupinfo[fid].name }
            })
          })
        }
      })

      this.FM.fetchsavedfriends().then((friedsinfo) => {
        if (new MyUtil().isObjNotEmpty(friedsinfo)) {
          this.friendsList.push({
            name: "-- Friends --",
            items: Object.keys(friedsinfo).filter(e=>e!="null"&&e!=null).map(fid => {
              return { "friendsId": fid, "name": friedsinfo[fid].name }
            })
          })
        }
      })
    },
    resetAll() {
      this.uploadFiles = null
      this.uploadPromiseList = []
      this.previewImageList = []
      this.submitImageUrlList = []
      this.whoAdd = null
      this.when = null
      this.whenBeforeFormated = new Date()
      this.where = null
      this.whereName = null
      this. who = null
      this.whoName = null
      this.what = null
      this.imgLoadingProgress = null
      this.imageUploadCount = 0
      this.failedImgDataList = []
      this.filterDoTimer = null
      this.$refs.imgInput.value = ""
    },
    fillAllFormsFromPostId(postid) {
      this.PSM.getpostfromid(postid).then((tlitem)=>{
        if (tlitem != null) {
          this.postedItem = tlitem
          this.postItem = tlitem
          this.whenBeforeFormated = tlitem.when
          this.what = tlitem.what
          this.previewImageList = tlitem.imgUrls==undefined ? [] : tlitem.imgUrls
          this.where = tlitem.where
          this.who = tlitem.who
        } else {
          alert("投稿が存在しないようです。")
        }
      })
    },
    updateFirebaseRealtimeDB(Obj, postid) {
      var diffObjs = new MyUtil().getDiffBetweenTwoObjects(this.postedItem, Obj)
      // 画像は常に書き換える。
      if (this.submitImageUrlList==undefined||this.submitImageUrlList==null) {
        // 新規アップロードがなかったらpreviewImageListをそのまま設定
        diffObjs["imgUrls"] = this.previewImageList
      } else {
        if (this.submitImageUrlList.length != 0) {
          // 新規アップロードがあったとき
          // プレビュー(URL, base64混在)からbase64を消して、submit(URL)と合体、設定
          diffObjs["imgUrls"] = this.previewImageList.filter(e=>e.includes("https://i.readme.tsumugu2626.xyz/")).concat(this.submitImageUrlList)
        } else {
          // 新規アップロードがなかったらpreviewImageListをそのまま設定
          diffObjs["imgUrls"] = this.previewImageList
        }
      }
      //
      this.PSM.updatepost(postid, diffObjs).then((tlitem)=>{
        this.resetAll()
        this.fillAllFormsFromPostId(this.propsPostId)
        alert("更新しました！")
      })
      .catch((error) => {
        //onError
        console.log("Firebase Error", error)
        alert("投稿に失敗しました")
      })
    },
    getWhereName() {
      return new Promise((resolve)=>{
        var tmpName = null
        Object.keys(this.placeList).forEach(k=>{
          this.placeList[k].items.forEach(l=>{
            if (l.placeId==this.where) {
              tmpName = l.name
            }
          })
        })
        if (tmpName != null) {
          resolve(tmpName)
        } else {
          resolve("名称未設定")
        }
      })
    },
    getEXIFinfo(elmId) {
      var elm = document.getElementById(elmId);
      var _this = this
      try {
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
      } catch(e) {
        alert("情報を正常に取得できませんでした")
        console.log("exif-js Error", e)
      }
    },
    setFormFromEXIFinfo(InfoFromEXIF) {
      if (InfoFromEXIF.date != undefined) {
        // XXX: 変換はのちのち...
        this.whenBeforeFormated = new Date(InfoFromEXIF.date)
        this.when = InfoFromEXIF.date
      }
      if (InfoFromEXIF.latitude != undefined && InfoFromEXIF.longitude != undefined) {
        this.PM.searchnearbyplacesbylatlon(InfoFromEXIF.latitude, InfoFromEXIF.longitude).then((response) => {
          this.nearbyPlaceList = [{name: "-- EXIF Result -- (なかったら自分で検索してね)", items: response.data }]
          new MyUtil().confirmExPromise("位置情報が埋め込まれていました。それを基に場所を入力しますか？").then(()=>{
            this.showModal("modal-where")
          })
        }).catch((error) => {
          console.log("Places Manager Error", error)
        })
      } else {
        alert("位置情報が埋め込まれていないようです...")
      }
    },
    searchNearbyPlaceByGPS() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { 
          var data = position.coords
	        var lat = data.latitude
	        var lon = data.longitude
          this.PM.searchnearbyplacesbylatlon(lat, lon).then((response) => {
            this.nearbyPlaceList = [{name: "-- GPS Result --", items: response.data }]
          }).catch((error) => {
            console.log("Places Manager Error", error)
          })
        }, (error) => { console.log("GeoLocation API Error", error) })
      } else {
        // alert("この端末は現在位置の取得に対応していません")
      }
    },
    filteringPlacesListFromSearchbox() {
      // 検索フォームが空白だったら終了
      if (this.whereAdd == null || this.whereAdd == undefined || this.whereAdd == "" || this.whereAdd.replace(/\s+/g, ' ') == "") {
        return false
      }
      this.placeListDisp = []
      console.log("----")
      Object.keys(this.placeList).forEach(k=>{
        var placeItems = this.placeList[k]
        // 名前やplaceidが未設定のものは弾く
        var filteredItems = placeItems.items.filter(e=>new MyUtil().isAllValueNotEmpty([e.placeId, e.name]))
        // 絞り込む
        filteredItems = filteredItems.filter(e=>(e.name.indexOf(this.whereAdd)!=-1))
        if (filteredItems.length != 0) {
          this.placeListDisp.push({
            name: placeItems.name,
            items: filteredItems
          })
        }
      })
      console.log("----")
    },
    removeImgAtInput(imgUrl) {
      if (imgUrl.includes("https://i.readme.tsumugu2626.xyz/")) {
        //URLだったら
        var index = this.previewImageList.indexOf(imgUrl)
        if (index > -1) {
          this.previewImageList.splice(index, 1);
        }
      } else {
        // base64だったら
        new Promise((resolve)=>{
          // FileListをArrayに変換
          var filesList = Array.from(this.$refs.imgInput.files)
          var dt = new DataTransfer();
          var createCount = 0
          Object.keys(filesList).map((i)=>{
            var file = filesList[i]
            // TODO: いちいちBase64算出するの非効率だからもっといい方法考えたい。
            this.createPreviewImage(file, e => {
              if (e.target.result != imgUrl) {
                dt.items.add(filesList[i])
              }
              createCount+=1
              if (createCount == filesList.length) {
                // 全件処理完了したらresolve
                resolve(dt)
              }
            })
          })
        }).then((dt)=>{
          this.$refs.imgInput.files = dt.files;
          // 更新を反映させる
          this.uploadFiles = this.$refs.imgInput.files
        })
      }
    },
    showModal(name) {
      this.$modal.show(name)
      // GPSから最寄りの場所を取得
      if (this.nearbyPlaceList.length == 0) {
        this.searchNearbyPlaceByGPS()
      }
    },
    hideModal(name) {
      this.$modal.hide(name)
    },
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files
      this.uploadFiles = files
    },
    onChangePlaceList() {
      this.placeList = []
      this.placeList = this.nearbyPlaceList.concat(this.userAddedPlaceList.concat(this.searchResultPlaceList))
    },
    createPreviewImage(file, callbackFunction) {
      const reader = new FileReader()
      reader.onload = e => {
        callbackFunction(e)
      }
      reader.readAsDataURL(file)
    },
    onAddWhereButton() {
      this.PM.searchplacesbyname(this.whereAdd).then((response) => {
        this.searchResultPlaceList = []
        this.searchResultPlaceList.push({name: "-- New User Add --", items: [{name: this.whereAdd, placeId: "pid_"+new MyUtil().uniqueStr()}]})
        this.searchResultPlaceList.push({name: "-- Search Result --", items: response.data})
      }).catch((error) => {
        console.log("Places Manager Error", error)
      })
    },
    onAddWhoButton() {
      this.FM.savemyfriend(this.whoAdd).then(() => {
        this.loadFriends()
        alert("追加しました！")
      })
      .catch((error) => {
        //onError
        console.log("Firebase Error", error)
      })
    },
    imgUploadChecker() {
      if (this.imageUploadCount+this.failedImgDataList.length == this.uploadPromiseList.length) {
        // this.imageUploadCountと、this.failedImgDataListの合計個数がthis.uploadPromiseListに等しかったら処理完了とみなす
        if (this.failedImgDataList.length != 0) {
          alert("画像のアップロードで問題が発生しました")
          //TODO: retry処理
          this.resetAll()
          this.hideModal('modal-loading')
        }
      }
    },
    onImgUploadSucceed() {
      this.imageUploadCount += 1
      this.imgUploadChecker()
    },
    onImgUploadFailed(data) {
      this.failedImgDataList.push(data)
      this.imgUploadChecker()
    },
    onSubmit() {
      if (new MyUtil().isAllValueNotEmpty([this.when, this.where])) {
        //ローディングのモーダルを表示
        this.showModal('modal-loading')
        // 画像をアップロードする
        if (this.uploadFiles != null) {
          Array.from(this.uploadFiles).forEach(file => {
            this.uploadPromiseList.push(new ProgressPromise((resolve, reject, progress)=>{
              imageCompression(file, {maxSizeMB:1}).then((compressedImg)=>{
                const data = new FormData();
                data.append('photo', compressedImg, compressedImg.name)
                this.IU.upload(data).then(res => {
                  this.onImgUploadSucceed()
                  resolve(res)
                }).catch(err => {
                  this.onImgUploadFailed(data)
                  reject(err)
                })
              })
            }))
          })
        }
        // this.uploadPromiseListが空だとProgressPromise.allが実行されないので適当に空Promiseを追加
        if (this.uploadPromiseList.length == 0) {
          this.uploadPromiseList.push(new ProgressPromise((resolve)=>{resolve()}))
        }
        // 2. アップロードが完了したらすべての情報を合わせてRealtimeDBにset
        ProgressPromise.all(this.uploadPromiseList)
        .progress(results => {
          this.imgLoadingProgress = ((Math.round(results.proportion*100*10)/10)/100)
          // console.log('Img Upload is in Progress', this.imgLoadingProgress+"%")
        })
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
          //DBに保存
          if (this.postedItem != null) {
            // Update処理
            this.updateFirebaseRealtimeDB(UserPostInfoObj, this.propsPostId)
          } else {
            this.setFirebaseRealtimeDB(UserPostInfoObj)
          }
          this.hideModal('modal-loading')
        })
      } else {
        alert("when, whereは必須項目です")
      }
    },
    setFirebaseRealtimeDB(Obj) {
      // placeIdと名前を保存(同名で上書きされるので存在確認はしない)
      this.PM.getIDtoLocationAPI(Obj.where).then((res)=>{
        this.PM.savemyplace(Obj.where, res).then(() => {
          this.PSM.savepost(Obj).then(()=>{
            alert("投稿しました！")
            this.resetAll()
          })
          .catch((error) => {
            console.log("Firebase Error", error)
            alert("投稿に失敗しました")
          })
        })
        .catch((error) => {
          console.log("Firebase Error", error)
        })
      })
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
  &__modal {
    &__contents {
      padding: 10px;
      width: 100%;
      height: 100%;
      overflow: scroll;
    }
  }
}
img {
  width: 200px;
}
</style>