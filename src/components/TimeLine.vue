<template>
  <div class="timeline">
    <div v-for="item in TLItemsList"><TLItem :propsItem=item /></div>
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
      TLItemsList: [],
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
        var returnPostsList = []
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
            returnPostsList.push(returnObj)
          })
        })
        this.TLItemsList = returnPostsList
        console.log(this.TLItemsList)
      })
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
