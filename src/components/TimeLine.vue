<template>
  <div class="TimeLine">
    <div class="TimeLine__mesnopost" v-show="TLItemsListDisp.length==0">{{propsNotFoundMes}}</div>
    <div class="TimeLine__Post" v-for="postsList in TLItemsListDisp">
      <div class="TimeLine__Post__Contents" v-for="(posts, day) in postsList">
        <div class="TimeLine__Post__Contents__title">{{day.replaceAll("-", "/")}}</div>
        <div v-for="post in posts"><TLItem :propsItem=post @removepost='removepost' :propsIsOwner="propsIsOwner" :key="post.when" /></div>
      </div>
    </div>
  </div>
</template>

<script>
import MyUtil from '../assets/MyUtil.js'
import TLItem from '@/components/TLItem.vue'
export default {
  name: 'TimeLine',
  components: {
    TLItem
  },
  props: {
    propsPosts: null,
    propsParams: null,
    propsPostsOrderedbyDateList: null,
    propsNotFoundMes: null,
    propsIsOwner: true
  },
  data() {
    return {
      TLItemsList: [],
      TLItemsListDisp: []
    }
  },
  watch: {
    TLItemsList() {
      var dispPostIdsList = this.TLItemsList.map(e=>e.postid)
      this.TLItemsListDisp = []
      Object.keys(this.propsPostsOrderedbyDateList).forEach(k=>{
        var placeItems = this.propsPostsOrderedbyDateList[k]
        var filteredItems = placeItems.filter(e=>dispPostIdsList.includes(e.postid))
        if (filteredItems.length != 0) {
          this.TLItemsListDisp.push({[k]: filteredItems})
        }
      })
      this.$emit("onChangedDispItem", this.TLItemsList)
    },
    propsParams() {
      this.filterItems()
      //
    }
  },
  methods: {
    removepost(postid) {
      this.$emit("removepost", postid)
    },
    filterItems() {
      this.TLItemsList = new MyUtil().filteringPostsWithPrms(this.propsPosts, this.propsParams)
    }
  },
  mounted() {
    this.filterItems()
  }
}
</script>

<style scoped lang="scss">
.TimeLine {
  padding: 20px;
  height: 100%;
  overflow: scroll;
  text-align: left;
  &__mesnopost {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 170%;
  }
  &__Post {
    &__Contents {
      &__title {
        font-size: 170%;
      }
    }
  }
}
</style>
