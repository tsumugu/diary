<template>
  <div class="TLItem">
    <div class="TLItem__when">{{item.when.split("T")[1].slice( 0, -3)}}</div>
    <div>{{item.what}}</div>
    <!--<div><img v-bind:src="src" v-for="(src, key) in item.imgUrls" :key="key"></div>-->
    <div><img v-lazy="src" v-for="(src, key) in item.imgUrls" :key="key"></div>
    <div v-show="item.where.name!=undefined"><div class="icon_img_conteiner"><img src="/img/location_on-black-48dp/2x/baseline_location_on_black_48dp.png" class="icon_img"> {{item.where.name}}</div></div>
    <div v-show="item.who.name!=undefined"><div class="icon_img_conteiner"><img src="/img/group-black-48dp/2x/outline_group_black_48dp.png" class="icon_img"> {{item.who.name}}</div></div>
    <div><div class="icon_img_conteiner"><span class="TLItem__tag" v-for="tag in item.tags" :key="key">#{{tag}}</span></div></div>
    <hr v-show="propsIsOwner">
    <div class="TLItem__button" v-show="propsIsOwner"><div class="icon_img_conteiner"><img src="/img/delete-black-48dp/2x/outline_delete_black_48dp.png" class="icon_img--large icon_clickable" v-on:click="removepost(item.postid)"></div></div>
    <div class="TLItem__button" v-show="propsIsOwner"><div class="icon_img_conteiner"><img src="/img/edit-black-48dp/2x/outline_edit_black_48dp.png" class="icon_img--large icon_clickable" v-on:click="gotoedit(item.postid)"></div></div>
  </div>
</template>

<script>
export default {
  name: 'TLItem',
  props: {
    propsItem: null,
    propsIsOwner: true
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
  border-radius: .25rem;
}
button {
  margin: 10px 10px 10px 0;
}
.TLItem {
  margin-top: 10px;
  padding: 20px;
  background-color: $white;
  border: solid 1px $main-border;
  border-radius: .25rem;
  &__when {
    font-size: 1.5rem;
  }
  &__tag {
    margin: 5px 5px 5px 0;
    padding: 5px;
    background-color: $main-accent-color;
    border-radius: .25rem;
  }
  &__button {
    display: inline-block;
  }
}
</style>
