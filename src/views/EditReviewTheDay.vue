<template>
  <div class="editdaypost">
    <div class="editdaypost__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="editdaypost__body" v-else>
      <div class="editdaypost__body__signined" v-if="isSignIn">
        <div><textarea v-model="reviewthedatetext"></textarea></div>
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
  name: 'editdaypost',
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      postid: null,
      date: null,
      reviewthedatetext: null,
      beforePostObj: null,
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
      this.postid = this.$route.params.postid
      this.RTDPM = new ReviewTheDayPostsManager(axios, database, this.userInfo)
      this.RTDPM.fetchallposts().then((result)=>{
        Object.keys(result).forEach(id => {
          if (id==this.postid) {
            this.beforePostObj = result[id]
            this.date = result[id].date
            this.reviewthedatetext = result[id].text
          }
        })
        if (this.reviewthedatetext == null) {
          alert("投稿が見つかりませんでした。")
          this.postid = null
        }
      })
    },
    onSubmit() {
      if (this.postid != null) {
        var diffObjs = new MyUtil().getDiffBetweenTwoObjects(this.beforePostObj, {date: this.date, text: this.reviewthedatetext})
        this.RTDPM.updatepost(diffObjs, this.postid).then(() => {
          alert("投稿しました！")
        })
        .catch((error) => {
          //onError
          console.log("Firebase Error", error)
          alert("投稿に失敗しました")
        })
      }
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
