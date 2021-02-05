<template>
  <div class="useranalyze__postlist__list__itemwrapper">
    <div class="UAPostListItem" v-on:click="onClickPostList(list)" v-for="list in item" :key="list.listid">
      <div class="UAPostListItem__img" :style="'background-image: url('+list.thumbnail+')'"></div>
      <div class="UAPostListItem__titlewrapper">
        <p class="UAPostListItem__titlewrapper__title">{{list.name}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UAPostListItem',
  props: {
    propsItem: null
  },
  data() {
    return {
      item: null
    }
  },
  methods: {
    onClickPostList(list) {
      this.$emit('onClickPostList', list.listid)
    }
  },
  watch: {
    propsItem() {
      this.item = this.propsItem
    }
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
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
