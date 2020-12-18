<template>
  <div class="home">
    <div class="home__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="home__body" v-else>
      <!-- 
      もしログイン済みだったらTLを表示、ログインしていなかったらウェルカムページを表示。
       -->
      <div class="home__body__signined" v-if="isSignIn"><TimeLine :propsUserInfo=userInfo /></div>
      <div class="home__body__welcome" v-else><Welcome /></div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

import Welcome from '@/components/Welcome.vue'
import TimeLine from '@/components/TimeLine.vue'

export default {
  name: 'Home',
  components: {
    Welcome,
    TimeLine
  },
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true
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
.home {
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
    &__welcome {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
