<template>
  <div class="regist">
    <div class="regist__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="regist__body" v-else>
      <div class="regist__body__signined" v-if="isSignIn">
        <!-- form -->
        <div><input type="datetime-local" placeholder="日付" v-model="when" /></div>
        <div><select v-model="where"><option disabled value="">場所</option><option v-for="(val, key) in placeList" v-bind:value="val.place_id" v-bind:disabled="val.place_id==null">{{val.name}}</option></select><div><input type="text" v-model="whereAdd" /><button v-on:click="onAddWhereButton">+</button></div></div>
        <div><select v-model="who"><option disabled value="">誰と行ったか</option><option v-for="(val, key) in friendsList" v-bind:value="val.place_id">{{val.name}}</option></select></div>
        <div><textarea placeholder="したこと" v-model="what" /></div>
        <div class="imgPreview">
          <img v-bind:src="src" v-for="(src, key) in previewImageList" :key="key">
        </div>
        <div><input type="file" @change="onFileChange" accept="image/*" multiple /></div>
        <div><button v-on:click="onSubmit">投稿</button></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ImgUploader from '../assets/ImgUploader.js'
import PlacesManager from '../assets/PlacesManager.js'
import firebase from 'firebase'
var database = firebase.database()

export default {
  name: "regist",
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      IU: null,
      PM: null,
      uploadFiles: null,
      uploadPromiseList: [],
      previewImageList: [],
      submitImageUrlList: [],
      userAddedPlaceList: [],
      nearbyPlaceList: [],
      placeList: [],
      friendsList: [
        {id:"thisisid-dddd", name:"Taro"},
        {id:"thisisid-eeee", name:"Jiro"},
        {id:"thisisid-ffff", name:"Saburo"}
      ],
      whereAdd: null,
      when: null,
      where: null,
      who: null,
      what: null
    }
  },
  watch: {
    userAddedPlaceList() {
      this.onChangePlaceList()
    },
    nearbyPlaceList() {
      this.onChangePlaceList()
    }
  },
  methods: {
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
      this.placeList = this.userAddedPlaceList.concat(this.nearbyPlaceList)
      //console.log(this.placeList, this.nearbyPlaceList, this.userAddedPlaceList)
    },
    createPreviewImage(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.previewImageList.push(e.target.result)
      }
      reader.readAsDataURL(file)
    },
    uploadImg(file) {
      return this.IU.upload(file)
    },
    onAddWhereButton() {
      //this.whereAddで検索してみる
      this.PM.searchplacesbyname(this.whereAdd).then((response) => {
        // selectを更新
        this.userAddedPlaceList = []
        this.userAddedPlaceList.push({name: "-- Search Result --", place_id: null})
        response.data.forEach((place) => {
          this.userAddedPlaceList.push(place)
        })
        this.userAddedPlaceList.push({name: "-- GPS Result --", place_id: null})
      }).catch((error) => {
        console.log("Places Manager Error", error)
      })
    },
    onSubmit() {
      // submit処理
      // 1. 画像をアップロードする
      if (this.uploadFiles != null) {
        Array.from(this.uploadFiles).forEach(file => {
          this.uploadPromiseList.push(this.uploadImg(file))
        })
      }
      // 2. アップロードが完了したらすべての情報を合わせてRealtimeDBにset
      Promise.all(this.uploadPromiseList).then((ImageUrls) => {
        //APIから帰ってきたJSONをパースして、URLを配列にまとめる
        ImageUrls.forEach((json) => {
          this.submitImageUrlList.push(json.data.url)
        })
        var UserPostInfoObj = {
          when: this.when,
          where: this.where,
          who: this.who,
          what: this.what,
          imgUrls: this.submitImageUrlList
        }
        //必須項目のチェック
        if (UserPostInfoObj.when != null && UserPostInfoObj.where != null && UserPostInfoObj.what != null) {
          if (UserPostInfoObj.when.replace(/\s+/g,'').length > 0 && UserPostInfoObj.where.replace(/\s+/g,'').length > 0 && UserPostInfoObj.what.replace(/\s+/g,'').length > 0) {
            //DBに保存
            this.setFirebaseRealtimeDB(UserPostInfoObj)
          } else {
            alert("when, where, whatは必須項目です")
          }
        } else {
          alert("when, where, whatは必須項目です")
        }
      })
    },
    setFirebaseRealtimeDB(Obj) {
      firebase.database().ref("posts/"+this.userInfo.uid).push(Obj).then(() => {
        alert("投稿しました！")
      })
      .catch((error) => {
        //onError
        console.log("Firebase Error", error)
        alert("投稿に失敗しました")
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

    this.IU = new ImgUploader(axios)
    this.PM = new PlacesManager(axios)
    // 現在地を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => { 
        var data = position.coords
	      var lat = data.latitude
	      var lon = data.longitude
        // "-33.8670522", "151.1957362"
        // 取得した現在地をもとに近辺のランドマークを取得
        this.PM.searchnearbyplacesbylatlon(lat, lon).then((response) => {
          // selectを更新
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
}
</script>

<style scoped lang="scss">
.regist {
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