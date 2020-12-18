<template>
  <div class="TLItem">
    <div>日時: {{item.when}}</div>
    <div>場所: {{item.where}}</div>
    <div>人: {{item.who}}</div>
    <div>したこと: {{item.what}}</div>
    <div><img v-bind:src="src" v-for="(src, key) in item.imgUrls" :key="key"></div>
  </div>
</template>

<script>
export default {
  name: 'TLItem',
  props: {
    propsItem: null
  },
  data() {
    return {
      item: null
    }
  },
  watch: {
    item() {
      console.log(this.item)
    }
  },
  mounted() {
    this.item = this.propsItem
  }
}
</script>

<style scoped lang="scss">
.TLItem {
  margin: 10px;
  padding: 10px;
  border: solid 1px red;
}
img {
  width: 100px;
}
</style>
