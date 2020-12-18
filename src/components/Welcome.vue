<template>
  <div class="welcome">
    Welcome! Please <router-link to="signup">Sign Up</router-link>! If you already sign up, Please <router-link to="signin">Sign In</router-link>!
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style scoped lang="scss">
.welcome {
  width: 100%;
  height: 100%;
}
</style>
