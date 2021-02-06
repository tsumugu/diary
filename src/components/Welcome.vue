<template>
  <div class="welcome">
    <div><h1>diary</h1></div>
    <div><div class="icon_img_conteiner" style="display: inline-block;"><img src="/img/login-black-48dp/2x/baseline_login_black_48dp.png" class="icon_img"><router-link to="signin">ログイン</router-link></div></div>
    <div><div class="icon_img_conteiner" style="display: inline-block;"><img src="/img/logout-black-48dp/2x/baseline_logout_black_48dp.png" class="icon_img"><router-link to="signup">新規登録</router-link></div></div>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style scoped lang="scss">
h1 {
  margin: 10px;
}
a {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.2rem;
}
.welcome {
  width: 100%;
  height: 100%;
}
</style>
