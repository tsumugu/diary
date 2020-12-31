<template>
  <div class="ReviewTheDay">
    <button @click="gotoedit()">編集</button>
    {{reviewText}}
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import ReviewTheDayPostsManager from '../assets/ReviewTheDayPostsManager.js'

export default {
  name: 'ReviewTheDay',
  props: {
    propsDate: null,
    userInfo: null
  },
  data() {
    return {
      date: null,
      reviewText: null,
      postid: null
    }
  },
  methods: {
    setReviewText() {
      new ReviewTheDayPostsManager(axios, database, this.userInfo).fetchallposts().then((result)=>{
        Object.keys(result).forEach(id => {
          if (result[id].date==this.date) {
            this.reviewText = result[id].text
            this.postid = id
          }
        })
      })
    },
    gotoedit(postid) {
      //this.$router.push('/regist/'+postid);
      window.open('https://diary.tsumugu2626.xyz/editdaypost/'+this.postid)
    }
  },
  mounted() {
    this.date = this.propsDate
    this.setReviewText()
  }
}
</script>

<style scoped lang="scss">
.ReviewTheDay {
  margin: 10px;
  padding: 10px;
  border: solid 1px red;
}
</style>
