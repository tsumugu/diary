<template>
  <div class="TLItem">
    <button @click="removepost(item.postid)">削除</button>
    <button @click="gotoedit(item.postid)">編集</button>
    <div>日時: {{item.when}}</div>
    <div>場所: {{item.where.name}}</div>
    <div>人: {{item.who.name}}</div>
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
  methods: {
    removepost(postid) {
      this.$emit("removepost", postid)
    },
    gotoedit(postid) {
      //this.$router.push('/regist/'+postid);
      window.open('https://diary.tsumugu2626.xyz/editpost/'+postid)
    }
  },
  mounted() {
    this.item = this.propsItem
  }
}
</script>

<style scoped lang="scss">
img {
  width: 100px;
}
button {
  margin: 10px 10px 10px 0;
}
.TLItem {
  margin-top: 10px;
  padding: 20px;
  background-color: #ffffff;
  border: solid 1px $main-border;
  border-radius: .25rem;
}
</style>
