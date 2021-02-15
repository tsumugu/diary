<template>
  <div class="squareimg"><img :data-src="propsSrc" class="lazyload" :key="propsKey" v-on:click="onClick(propsSrc)"></div>
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
  &>img {
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: cover;
    border-radius: 0.25rem;
  }
}
</style>
