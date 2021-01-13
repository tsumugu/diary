<template>
  <div class="useranalyze">
    {{userId}}
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import PlacesManager from '../assets/PlacesManager.js'

export default {
  name: "useranalyze",
  components: {
  },
  data() {
    return {
      userId: null,
      PM: null
    }
  },
  mounted() {
    this.userId = this.$route.params.userid
    var test = {uid: this.userId}
    this.PM = new PlacesManager(axios, database, {uid: this.userId})
    this.PM.fetchusersavedplaces().then((places)=>{
      console.log(places)
    })
  }
}
</script>

<style scoped lang="scss">
.useranalyze {
  width: 100%;
  height: 100%;
}
</style>