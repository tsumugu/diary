<template>
  <div class="signout">
    <h1>SING OUT</h1>
    <button @click="singout">Sing out Now!!</button>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  methods: {
    singout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert("Logout!");
        })
        .catch(error => {
          alert(error);
        });
    }
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style scoped>
</style>
