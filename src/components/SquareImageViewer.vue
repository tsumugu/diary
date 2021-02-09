<template>
  <div class="squareimg" v-lazy:background-image="propsSrc" :key="propsKey"></div>
</template>

<script>
export default {
  name: 'SquareImageViewer',
  props: {
    propsSrc: null,
    propsKey: null
  }
}
</script>

<style scoped lang="scss">
.squareimg {
  display: inline-block;
  margin: 5px;
  width: 100px;
  height: 100px;
  background-color: $main-mainarea-bg;
  background-position: center center;
  background-size: cover;
  border-radius: 0.25rem 0 0 0.25rem;
}
</style>
