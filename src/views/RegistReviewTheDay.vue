<template>
  <div class="registday">
    <div class="registday__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="registday__body" v-else>
      <div class="registday__body__signined" v-if="isSignIn">
        <div><textarea v-model="reviewthedatetext"></textarea></div>
        <div><textarea v-model="tagsStr"></textarea></div>
        <button v-on:click="getKeywords()">キーワードを抽出してタグ付け</button>
        <div v-on:click="onSubmit"><button>送信</button></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import MyUtil from '../assets/MyUtil.js'
import ReviewTheDayPostsManager from '../assets/ReviewTheDayPostsManager.js'

export default {
  name: 'registday',
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      reviewthedatetext: null,
      tagsStr: "",
      RTDPM: null
    }
  },
  watch: {
    userInfo(after, before) {
      if (this.userInfo != null) {
        this.initMain()
      }
    }
  },
  methods: {
    initMain() {
      this.RTDPM = new ReviewTheDayPostsManager(axios, database, this.userInfo)
    },
    onSubmit() {
      var date = this.$route.params.date
      if (!isNaN(new Date(date).getTime())) {
        //regist
        this.RTDPM.savepost({date: date, text: this.reviewthedatetext, tags: this.tagsStr.split("\n").filter(Boolean)}).then(() => {
          alert("投稿しました！")
        })
        .catch((error) => {
          //onError
          console.log("Firebase Error", error)
          alert("投稿に失敗しました")
        })
      } else {
        alert("パラメータが不正です")
      }
    },
    getKeywords() {
      new MyUtil().getKeywordsFromSentence(this.reviewthedatetext).then((res)=>{
        res.forEach(e => {
          this.tagsStr += Object.keys(e)[0]+"\n"
        })
      })
    }
  },
  mounted() {
    //ログイン状況を確認
    const _this = this
    firebase.auth().onAuthStateChanged(user => {
      _this.isSignIn = (user != null)
      _this.userInfo = user
      _this.isNowLoading = false
    })
  }
}
</script>

<style lang="scss">
.registday {
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
</style>
