<template>
  <div class="timeline">
    <div v-for="item in TLItemsList"><TLItem :propsItem=item /></div>
  </div>
</template>

<script>
import TLItem from '@/components/TLItem.vue'
import firebase from 'firebase'
var database = firebase.database()

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
      TLItemsList: []
    }
  },
  watch: {
    userInfo() {
      console.log(this.userInfo)
    }
  },
  mounted() {
    this.userInfo = this.propsUserInfo
    firebase.database().ref("posts/"+this.userInfo.uid).on('value', (snapshot) =>{
      this.TLItemsList = snapshot.val()
    })
  }
}
</script>

<style scoped lang="scss">
.timeline {
  width: 100%;
  height: 100%;
}
</style>
