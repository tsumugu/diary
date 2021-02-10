<template>
  <div class="squareimg" v-lazy:background-image="propsSrc" :key="propsKey" v-on:click="onClick(propsSrc)"></div>
</template>

<script>
export default {
  name: 'SquareImageViewer',
  props: {
    propsSrc: null,
    propsKey: null
  },
  methods: {
    onClick(url) {
      this.$emit("onClick", url)
    }
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
