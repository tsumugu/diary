<template>
  <div class="signout">
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  methods: {
    singout() {
      firebase.auth().signOut()
      .then(() => {
        this.$router.push({path:'/'})
      })
      .catch(error => {
        alert(error)
        this.$router.push({path:'/'})
      })
    }
  },
  mounted() {
    this.singout()
  }
}
</script>

<style scoped>
</style>
