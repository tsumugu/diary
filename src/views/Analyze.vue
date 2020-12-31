<template>
  <div class="analyze">
    <div class="analyze__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="analyze__body" v-else>
      <div class="analyze__body__signined" v-if="isSignIn">
        aa
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'analyze',
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true
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
      firebase.database().ref("posts/"+this.userInfo.uid).on('value', (snapshot) =>{
        var tlitems = snapshot.val()
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
.analyze {
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
