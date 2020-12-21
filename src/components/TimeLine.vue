<template>
  <div class="timeline">
    <div v-for="(posts, day) in TLItemsList">
      <h1>{{day}}</h1>
      <div v-for="post in posts">
        <TLItem :propsItem=post />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import TLItem from '@/components/TLItem.vue'

export default {
  name: 'TimeLine',
  components: {
    TLItem
  },
  props: {
    propsUserInfo: null
  },
  data() {
    return {
      userInfo: null,
      postsList: [],
      postsOrderedbyDateList: [],
      TLItemsList: {},
      PM: null,
      FM: null
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
      this.PM = new PlacesManager(axios, database, this.userInfo)
      this.FM = new FriendsManager(axios, database, this.userInfo)
      firebase.database().ref("posts/"+this.userInfo.uid).on('value', (snapshot) =>{
        var tlitems = snapshot.val()
        var tlitemslength = Object.keys(tlitems).length
        Object.keys(tlitems).forEach(postid => {
          var itemObj = tlitems[postid]
          //nameを取得していく
          var placeNamePromise = this.PM.placeidtoname(itemObj.where)
          var friendNamePromise = this.FM.friendidtoname(itemObj.who)
          Promise.all([placeNamePromise, friendNamePromise]).then((names) => {
            var placeName = names[0]
            var friendName = names[1]
            var returnObj = {
              imgUrls: itemObj.imgUrls?itemObj.imgUrls:null,
              what: itemObj.what,
              when: itemObj.when,
              where: {
                "placeId": itemObj.where,
                "name": placeName
              },
              who: {
                "friendId": itemObj.who,
                "name": friendName
              }
            }
            this.postsList.push(returnObj)
            // 全件処理が完了したら実行
            if (tlitemslength == this.postsList.length) {
              this.makePostsOrderedbyDateList()
            }
          })
        })
      })
    },
    makePostsOrderedbyDateList() {
      // 日ごとに
      this.postsOrderedbyDateList = {}
      this.postsList.forEach(post => {
        //var tmpDayString = post.when.split("T")[0].split("-").join("/")
        var tmpDayString = post.when.split("T")[0]
        if (this.postsOrderedbyDateList[tmpDayString] == undefined) {
          this.postsOrderedbyDateList[tmpDayString] = []
        }
        this.postsOrderedbyDateList[tmpDayString].push(post)
      })
      this.makeTLItemsList()
    },
    makeTLItemsList() {
      var todayDate = moment().utcOffset("+0900").format("YYYY-MM-DD")
      var posts = null
      var postDate = null

      var todayPosts = this.postsOrderedbyDateList[todayDate]
      if (todayPosts != undefined) {
        posts = todayPosts
        postDate = todayDate
      } else {
        var latestPostDate = Object.keys(this.postsOrderedbyDateList)[0]
        if (latestPostDate != undefined) {
          posts = this.postsOrderedbyDateList[latestPostDate]
          postDate = latestPostDate
        }
      }
      this.TLItemsList = {}
      this.TLItemsList[postDate] = posts
      //.split("-").join("/")
      console.log(this.TLItemsList)
    }
  },
  mounted() {
    this.userInfo = this.propsUserInfo
  }
}
</script>

<style scoped lang="scss">
.timeline {
  width: 100%;
  height: 100%;
}
</style>
