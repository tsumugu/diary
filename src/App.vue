<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  mounted() {
    /*
    var _this = this
    window.alert = function(mes) {
      console.log(mes)
    }
    */
  }
}
</script>

<style lang="scss">
@import './assets/forms.scss';
* {
  font-family: 'M PLUS 1p', sans-serif;
}
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
