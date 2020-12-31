<template>
  <div class="friends">
    <div class="friends__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="friends__body" v-else>
      <div class="home__body__signined" v-if="isSignIn"><EditFriendsGroup :propsUserInfo=userInfo /></div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import EditFriendsGroup from '@/components/EditFriendsGroup.vue'

export default {
  name: "editfriends",
  components: {
    EditFriendsGroup
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

<style scoped lang="scss">
.friends {
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