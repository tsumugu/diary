<template>
  <div class="editevent">
    <div class="editevent__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="editevent__body" v-else>
      <div class="editevent__body__signined" v-if="isSignIn">
        <modal class="editevent__modal" name="modal-loading" :clickToClose="false" width="250px" height="250px">
          <LoadingDialog propsMessage="test" :propsLoadingProgress=imgLoadingProgress />
        </modal>
        <!-- -->
        <div class="editevent__body__signined__datepicker"><DatePicker v-model="whenBeforeFormated" mode="dateTime" is24hr><template v-slot="{ inputValue, inputEvents }"><input class="editevent__body__signined__datepicker__input" :value="inputValue" v-on="inputEvents" /></template></DatePicker></div>
        <!-- -->
        <div class="editevent__body__signined__what"><textarea class="editevent__body__signined__what__textarea" placeholder="したこと" v-model="what" /></div>
        <!-- -->
        <div class="editevent__body__signined__imgpreview">
          <div v-for="(src, key) in previewImageList">
            <div class="editevent__body__signined__imgpreview__item">
              <div class="editevent__body__signined__imgpreview__item__buttons">
                <img src="/img/delete-black-48dp/2x/outline_delete_black_48dp.png" class="editevent__body__signined__imgpreview__item__buttons__button icon_clickable" v-on:click="removeImgAtInput(src)">
                <img src="/img/edit_location-black-48dp/2x/outline_edit_location_black_48dp.png" title="画像に埋め込まれているデータから日時と場所を入力" class="editevent__body__signined__imgpreview__item__buttons__button icon_clickable" v-on:click="getEXIFinfo('prev-' + key)">
              </div>
              <img v-bind:src="src" v-bind:id="'prev-' + key" :key="key">
            </div>
          </div>
        </div>
        <div class="editevent__body__signined__upload"><input type="file" ref="imgInput" @change="onFileChange" accept="image/*" multiple /></div>
         <!-- -->
        <div class="editevent__body__signined__where"><div class="editevent__body__signined__where__contents"><div class="icon_img_conteiner" v-on:click="showModal('modal-where')"><img src="/img/location_on-black-48dp/2x/baseline_location_on_black_48dp.png" class="icon_img"> {{whereName==null?"未入力":whereName}}</div></div></div>
        <modal class="editevent__modal" name="modal-where" :clickToClose="true" width="95%" height="95%">
          <div class="editevent__modal__contents">
            <div style="height:40px;text-align:left;"><img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" v-on:click="hideModal('modal-where')" class="icon_clickable" style="width:40px;height:40px;"></div>
            <div><button v-on:click="searchNearbyPlaceByGPS">GPSを更新</button></div>
            <div><input type="text" v-model="whereAdd" @keyup.enter="onAddWhereButton" /></div>
            <ul>
              <li>
                <ol>
                  <li>
                    <label><input type="radio" v-model="where" value="null">設定しない</label>
                  </li>
                </ol>
              </li>
            </ul>
            <ul>
              <li v-for="places in placeListDisp">
                <p class="editevent__modal__contents__title">{{places.name}}</p>
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
        <div class="editevent__body__signined__who"><div class="editevent__body__signined__who__contents"><div class="icon_img_conteiner" v-on:click="showModal('modal-who')"><img src="/img/group-black-48dp/2x/outline_group_black_48dp.png" class="icon_img"> {{whoName==null?"未入力":whoName}}</div></div></div>
        <modal class="editevent__modal" name="modal-who" :clickToClose="true" width="95%" height="95%">
          <div class="editevent__modal__contents">
            <div style="height:40px;text-align:left;"><img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" v-on:click="hideModal('modal-who')" class="icon_clickable" style="width:40px;height:40px;"></div>
            <ul>
              <!---->
              <li>
                <p></p>
                <ol>
                  <li>
                    <label><input type="radio" v-model="who" value="null">設定しない</label>
                  </li>
                </ol>
              </li>
              <!---->
              <li v-for="friends in friendsList">
                <p class="editevent__modal__contents__title">{{friends.name}}</p>
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
        <div class="editevent__body__signined__tags">
          <div><span v-for="tag in tags" @mouseover="onTagHovered" @mouseleave="onTagHoverLeaved" v-on:click="onTagClicked" :key="tag">#{{tag}} </span> #<input type="text" class="taginput" ref="taginput" @keyup.enter="onEnterTagInput"></div>
          <div>
            <div>もしかして: <button class="tagSuggestButton" v-for="(tag, index) in tagSuggestList" v-on:click="onAddTagButton(tag)" :ref="'tagSuggest_'+index">#{{tag}}</button></div>
            <div style="display: inline-block;"><div class="icon_img_conteiner"><button class="tagSuggestButton--keyword" v-on:click="getKeywordsFromSentence()">文章からタグの候補を抽出する</button><img src="/img/svg-loading-spinner.svg" class="icon_img" v-show="isLoadingGetKeywords"></div></div>
          </div>
        </div>
        <!-- -->
        <div class="editevent__body__signined__submit"><button v-on:click="onSubmit">投稿</button></div>
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
      placeListIdandName: {},
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
      filterDoTimer: null,
      tags: [],
      tagSuggestList: [],
      isLoadingGetKeywords: false
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
      //this.placeListIdandName = {}
      this.placeList.map(e=>{
        Object.keys(e.items).forEach(i => {
          var item = e.items[i]
          this.placeListIdandName[item.placeId] = item.name
        })
      })
      // 再度フィルタリング
      this.filteringPlacesListFromSearchbox()
    },
    who() {
      if (this.who != "null") {
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
      } else {
        this.whoName = null
        this.hideModal("modal-who")
      }
    },
    where() {
      if (this.where != "null") {
        this.getWhereName().then((name)=>{
          this.whereName = name
          //モーダルを閉じる
          this.hideModal("modal-where")
        })
      } else {
        this.whereName = null
        this.hideModal("modal-where")
      }
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
    },
    tags() {
      this.onTagsListChange()
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
            name: "以前に入力したことがある場所",
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

      this.PSM.fetchalltags(5).then((res)=>{
        this.tagSuggestList = res.map(e=>e.name)
        //描画が終わったら
        this.$nextTick(function() {
          this.onTagsListChange()
        })
      })

      if (this.propsPostId != undefined) {
        // editpostからのアクセス。
        this.fillAllFormsFromPostId(this.propsPostId)
      } else {
        this.whenBeforeFormated = new Date()
      }
    },
    loadFriends() {
      this.friendsList = []
      this.FM.fetchfriendsgroup().then((friedsgroupinfo) => {
        if (new MyUtil().isObjNotEmpty(friedsgroupinfo)) {
          this.friendsList.push({
            name: "フレンド リスト",
            items: Object.keys(friedsgroupinfo).filter(e=>e!="null"&&e!=null).map(fid => {
              return { "friendsId": "fg - "+fid, "name": friedsgroupinfo[fid].name }
            })
          })
        }
      })

      this.FM.fetchsavedfriends().then((friedsinfo) => {
        if (new MyUtil().isObjNotEmpty(friedsinfo)) {
          this.friendsList.push({
            name: "フレンド",
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
      //this.when = null
      //this.whenBeforeFormated = new Date()
      this.where = null
      this.whereName = null
      this. who = null
      this.whoName = null
      this.what = null
      this.imgLoadingProgress = null
      this.imageUploadCount = 0
      this.failedImgDataList = []
      this.filterDoTimer = null
      //this.tagSuggestList = []
      this.tags = []
      this.$refs.imgInput.value = ""
    },
    fillAllFormsFromPostId(postid) {
      //
      /*
      this.PSM.fetchalltags().then((res)=>{
        this.tagSuggestList = res
      })
      */
      //

      this.PSM.getpostfromid(postid).then((tlitem)=>{
        if (tlitem != null) {
          this.postedItem = tlitem
          this.postItem = tlitem
          this.whenBeforeFormated = new Date(tlitem.when)
          this.what = tlitem.what
          //this.uploadFiles = tlitem.imgUrls==undefined ? [] : tlitem.imgUrls
          this.previewImageList = tlitem.imgUrls==undefined ? [] : tlitem.imgUrls
          this.where = tlitem.where
          this.who = tlitem.who
          if (new MyUtil().isAllValueNotEmpty([tlitem.tags])) {
            this.tags = tlitem.tags.concat([])
          }
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
    getKeywordsFromSentence() {
      if (new MyUtil().isAllValueNotEmpty([this.what])) {
        this.isLoadingGetKeywords = true
        new MyUtil().getKeywordsFromSentence(this.what).then((res)=>{
          this.isLoadingGetKeywords = false
          if (res.length > 0) {
            res.forEach(e => {
              var keyword = Object.keys(e)[0]
              if (!this.tagSuggestList.includes(keyword)) {
                this.tagSuggestList.unshift(keyword)
              }
            })
          } else {
            alert("タグの候補が見つかりませんでした")
          }
        })
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
          this.nearbyPlaceList = [{name: "画像に埋め込まれていた情報からの検索結果", items: response.data }]
          new MyUtil().confirmExPromise("位置情報が埋め込まれていました。それを基に場所を入力しますか？").then(()=>{
            this.whereAdd = null
            this.showModal("modal-where")
          })
        }).catch((error) => {
          console.log("Places Manager Error", error)
        })
      } else {
        alert("画像に情報が埋め込まれていないようです...")
      }
    },
    searchNearbyPlaceByGPS() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { 
          var data = position.coords
	        var lat = data.latitude
	        var lon = data.longitude
          this.PM.searchnearbyplacesbylatlon(lat, lon).then((response) => {
            this.nearbyPlaceList = [{name: "GPSからの検索結果", items: response.data }]
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
      if (this.placeListDisp.length == 0) {
        this.placeListDisp.push({
          name: "検索しても見つからなかった場合はこれを選択",
          items: [{name: this.whereAdd, placeId: "pid_"+new MyUtil().uniqueStr()}]
        })
        this.placeList.push({
          name: "検索しても見つからなかった場合はこれを選択",
          items: [{name: this.whereAdd, placeId: "pid_"+new MyUtil().uniqueStr()}]
        })
      }
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
          this.previewImageList = []
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
    onTagsListChange() {
      for (var i=0;i<this.tagSuggestList.length;i++) {
        var button = this.$refs['tagSuggest_'+i][0]
        var value = button.innerText.slice(1)
        if (this.tags == null || this.tags == undefined) {
          button.disabled = false
        } else {
          if (this.tags.includes(value)) {
            button.disabled = true
          } else {
            button.disabled = false
          }
        }
      }
    },
    onEnterTagInput(e) {
      if (new MyUtil().isAllValueNotEmpty([this.$refs.taginput.value]) && !this.tags.includes(this.$refs.taginput.value)) {
        this.tags.push(this.$refs.taginput.value)
        this.$refs.taginput.value = ""
      }
    },
    onFileChange(e) {
      if (this.previewImageList.filter(e=>e.includes("https://i.readme.tsumugu2626.xyz/")).length != 0) {

      }
      const files = e.target.files || e.dataTransfer.files
      //this.uploadFiles = files
      if (this.previewImageList.filter(e=>e.includes("https://i.readme.tsumugu2626.xyz/")).length == 0) {
        this.previewImageList = []
      }
      if (this.uploadFiles == null) {
        this.uploadFiles = files
      } else {
        this.uploadFiles = [...this.uploadFiles, ...files]
      }
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
        //this.searchResultPlaceList.push({name: "検索しても見つからなかった場合はこれを選択", items: [{name: this.whereAdd, placeId: "pid_"+new MyUtil().uniqueStr()}]})
        this.searchResultPlaceList.push({name: "検索結果", items: response.data})
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
    onTagHovered(e) {
      e.target.innerHTML = "<s>"+e.target.innerHTML+"</s>"
    },
    onTagHoverLeaved(e) {
      e.target.innerHTML = e.target.innerHTML.replace(/<s>|<\/s>/g, "")
    },
    onTagClicked(e) {
      var text = e.target.innerText.slice(1).replace(" ", "")
      var index = this.tags.indexOf(text)
      if (index > -1) {
        this.tags.splice(index, 1)
      }
    },
    onAddTagButton(tagval) {
      if (!new MyUtil().isAllValueNotEmpty([this.tags])) {
        this.tags = []
      }
      this.tags.push(tagval)
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
            imgUrls: this.submitImageUrlList,
            tags: this.tags
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
        alert("日時, 場所は必須項目です")
      }
    },
    setFirebaseRealtimeDB(Obj) {
      // placeIdと名前を保存(同名で上書きされるので存在確認はしない)
      this.PM.getIDtoLocationAPI(Obj.where).then((res)=>{
        if (res.name == null) {
          res.name = this.placeListIdandName[Obj.where]
        }
        if (!new MyUtil().isAllValueNotEmpty([res.name])) {
          console.log("GetPlaceName Error", error)
          alert("投稿に失敗しました")
        } else {
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
            // サーバがエラーを吐くなどしてJSONを正常に取得できないことがあるので、その場合はエラーを表示
            alert("投稿に失敗しました")
            console.log("Firebase Error", error)
          })
        }
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
img {
  width: 200px;
}
ul {
  padding: 0;
  list-style: none;
}
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
      padding: 20px;
      width: 100%;
      height: 100%;
      &__imgpreview {
        text-align: center;
        &__item {
          display: inline-block;
          position: relative;
          &__buttons {
            position: absolute;
            top: 0;
            left: 0;
            margin: 10px;
            &__button {
              width: 40px;
              height: 40px;
            }
          }
          &>img {
            border: 1px solid $main-border;
          }
        }
      }
      &__datepicker{
        &__input {
          border: none;
          font-size: 1.5rem;
        }
      }
      &__what {
        &__textarea {
          width: 300px;
          resize: none;
          font-size: 1rem;
        }
      }
      &__where {
        &__contents {
          display: inline-block;
        }
      }
      &__who {
        &__contents {
          display: inline-block;
        }
      }
      &__submit {
        margin: 5px;
      }
    }
  }
  &__modal {
    &__contents {
      padding: 10px;
      width: 100%;
      height: 100%;
      overflow: scroll;
      &__title {
        font-size: 1.2rem;
      }
    }
  }
}
.taginput {
  width: 200px;
  padding: 0;
  font-size: 100%;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid $main-accent-color;
  outline: 0;
  &:hover {
    box-shadow: none;
  }
}
.tagSuggestButton {
  margin-right: 5px;
  padding: 1px;
  background-color: transparent;
  font-size: 100%;
  &--keyword {
    margin-right: 5px;
    padding: 1px;
    font-size: 100%;
    background-color: $main-mainarea-bg;
    border: solid 1px $form-main-darker;
  }
}
.alignleft {
  text-align: left;
}
</style>