<template>
  <div class="signin">
    <div>
      <h1>ログイン</h1>
    </div>
    <div>
      <h2>E-mail</h2>
      <input type="email" v-model="email" />
    </div>
    <div>
      <h2>Password</h2>
      <input type="password" v-model="password" />
    </div>
    <div>
      <button @click="userSingIn">ログインする</button>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  methods: {
    userSingIn() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        alert("ログインしました")
        this.$router.push({path:'/'})
      })
      .catch(error => {
        alert(error.message)
        console.error(error.message)
      })
    }
  },
  data () {
    return {
      email: "",
      password: ""
    }
  }
}
</script>

<style scoped>
h1, h2 {
  margin: 0;
}
.signin > div {
  margin: 10px;
}
</style>
