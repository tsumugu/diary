<template>
  <div class="regist">
    <div class="regist__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="regist__body" v-else>
      <div class="regist__body__signined" v-if="isSignIn">
        <!-- form -->
        <div><input type="datetime-local" placeholder="日付" v-model="when" /></div>
        <div><select v-model="where"><option disabled value="">場所</option><option v-for="(val, key) in placeList" v-bind:value="val.id">{{val.name}}</option></select></div>
        <div><select v-model="who"><option disabled value="">誰と行ったか</option><option v-for="(val, key) in friendsList" v-bind:value="val.id">{{val.name}}</option></select></div>
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
      uploadFiles: null,
      uploadPromiseList: [],
      previewImageList: [],
      submitImageUrlList: [],
      placeList: [
        {id:"thisisid-aaaa", name:"Tokyo"},
        {id:"thisisid-bbbb", name:"Kyoto"},
        {id:"thisisid-cccc", name:"Hokkaido"}
      ],
      friendsList: [
        {id:"thisisid-dddd", name:"Taro"},
        {id:"thisisid-eeee", name:"Jiro"},
        {id:"thisisid-ffff", name:"Saburo"}
      ],
      when: null,
      where: null,
      who: null,
      what: null
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
        ImageUrls.forEach(json => {
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
      .catch(function(error) {
        //onError
        console.log(error)
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