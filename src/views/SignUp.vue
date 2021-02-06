<template>
  <div class="signup">
    <div>
      <h1>新規登録</h1>
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
      <button @click="createUserAccount">登録する</button>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  methods: {
    createUserAccount() {
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
      .then(() => {
        alert("アカウントを作成しました！")
        this.$router.push({path:'/signin'})
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
.signup > div {
  margin: 10px;
}
</style>
