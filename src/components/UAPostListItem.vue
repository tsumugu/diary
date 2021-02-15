<template>
  <div class="useranalyze__postlist__list__itemwrapper">
    <div class="UAPostListItem" v-on:click="onClickPostList(list)" v-for="list in item" :key="list.listid">
      <div class="UAPostListItem__img" :style="'background-image: url('+list.thumbnail+')'"></div>
      <div class="UAPostListItem__titlewrapper">
        <img src="/img/lock-white-48dp.svg" style="width: 1.5rem;" v-show='list.status=="private"'>
        <p class="UAPostListItem__titlewrapper__title">{{MU.genPostListDate(list.sincedate, list.untildate)}}{{list.name}}</p>
        <img src="/img/edit-black-48dp/2x/outline_edit_black_48dp.png" style="width: 1.5rem;" v-show="isDispIcon">
        <img src="/img/delete-black-48dp/2x/outline_delete_black_48dp.png" style="width: 1.5rem;" v-show="isDispIcon">
      </div>
    </div>
  </div>
</template>

<script>
import MyUtil from '../assets/MyUtil.js'
export default {
  name: 'UAPostListItem',
  props: {
    propsItem: null,
    isDispIcon: null
  },
  data() {
    return {
      item: null,
      MU: null
    }
  },
  methods: {
    onClickPostList(list) {
      //this.$emit('onClickPostList', list.listid)
      this.$emit('onClickPostList', list)
    }
  },
  watch: {
    propsItem() {
      this.item = this.propsItem
    }
  },
  mounted() {
    this.MU = new MyUtil()
  }
}
</script>

<style scoped lang="scss">
p {
  margin: 0;
  padding: 0;
}
.UAPostListItem {
  display: grid;
  grid-template-columns: 80px 1fr;
  margin: 5px;
  border: 1px solid $main-border;
  border-radius: 0.25rem;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
  &__titlewrapper {
    display: flex;
    align-items: center;
    margin: 10px;
    &__title {
      word-break: break-all;
    }
  }
  &__img {
    width: 80px;
    height: 80px;
    background-color: $main-mainarea-bg;
    background-position: center center;
    background-size: cover;
    border-radius: 0.25rem 0 0 0.25rem;
  }
}
</style>
