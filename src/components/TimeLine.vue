<template>
  <div class="timeline">
    <div v-for="(posts, day) in TLItemsList">
      <div><button v-on:click="onDayPrevious"><</button><h1 class="timeline__daytitle">{{day}}</h1><button v-on:click="onDayForward">></button></div>
      <div v-for="post in posts">
        <TLItem :propsItem=post @removepost='removepost' :key="post.when" />
      </div>
    </div>
  </div>
</template>

<script>
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
      postsObDKeyList: [],
      TLItemsList: {},
      PM: null,
      FM: null,
      postDateIndex: 0
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
              postid: postid,
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
      // keyをsort
      var tmpPKL = Object.keys(this.postsOrderedbyDateList)
      tmpPKL.sort(function(a, b) {
        if (a < b) {
          return 1;
        } else {
          return -1;
        }
      })
      this.postsObDKeyList = tmpPKL
      this.makeTLItemsList()
    },
    makeTLItemsList(arg_postDateIndex) {
      var posts = null
      var postDate = null
      var postDateIndex = 0
      if (arg_postDateIndex != undefined) {
        postDateIndex = arg_postDateIndex
      }
      var postDateByIndex = this.postsObDKeyList[postDateIndex]
      if (postDateByIndex != undefined) {
        posts = this.postsOrderedbyDateList[postDateByIndex]
        postDate = postDateByIndex
      }
      if (posts!=null && postDate!=null) {
        this.TLItemsList = {}
        this.TLItemsList[postDate] = posts
      }
    },
    onDayPrevious() {
      if (this.postsObDKeyList[this.postDateIndex-1] != undefined) {
        this.postDateIndex -= 1
        this.makeTLItemsList(this.postDateIndex)
      }
    },
    onDayForward() {
      if (this.postsObDKeyList[this.postDateIndex+1] != undefined) {
        this.postDateIndex += 1
        this.makeTLItemsList(this.postDateIndex)
      }
    },
    confirmExPromise(message) {
      if (window.confirm(message)) {
        return Promise.resolve();
      }
      return Promise.reject();
    },
    removepost(postid) {
      this.confirmExPromise("この投稿を本当に削除しますか?").then(() => {
        firebase.database().ref("posts/"+this.userInfo.uid+"/"+postid).remove().then(function(){
          alert('削除しました！')
        })
      });
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
  &__daytitle {
    display: inline;
    margin: 0 10px 0 10px;
  }
}
</style>
