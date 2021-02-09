<template>
  <div class="TimeLine">
    <div class="TimeLine__mesnopost" v-show="TLItemsListDisp.length==0">{{propsNotFoundMes}}</div>
    <div class="TimeLine__Post" v-for="postsList in TLItemsListDisp">
      <div class="TimeLine__Post__Contents" v-for="(posts, day) in postsList">
        <div class="TimeLine__Post__Contents__title">{{day.replaceAll("-", "/")}}</div>
        <div v-for="post in posts"><TLItem :propsItem=post @removepost='removepost' :key="post.when" /></div>
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
    propsNotFoundMes: null
  },
  data() {
    return {
      TLItemsList: [],
      TLItemsListDisp: [],
      searchQueryText: null,
      selectedDate: null,
      selectedPlaceId: null,
      selectedFriendId: null,
      tagsList: []
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
      this.$emit("onChangedDispItemCount", this.TLItemsList.length)
    },
    propsParams() {
      this.searchQueryText = this.propsParams.keyword
      this.selectedDate = this.propsParams.when
      this.selectedPlaceId = this.propsParams.where
      this.selectedFriendId = this.propsParams.who
      this.tagsList = this.propsParams.tags
      //フィルタリング
      var tmpRes = this.propsPosts
      if (new MyUtil().isAllValueNotEmpty([this.searchQueryText])) {
        tmpRes = tmpRes.filter(e=>new MyUtil().isObjectIncludeQureyText([e.what, e.where.name, e.who.name, e.tags].flat(), this.searchQueryText))
      }
      if (new MyUtil().isAllValueNotEmpty([this.selectedDate])) {
        tmpRes = tmpRes.filter(e=>{
          if (e.when != undefined) {
            return e.when.split("T")[0]==this.selectedDate
          }
        })
      }
      if (new MyUtil().isAllValueNotEmpty([this.selectedPlaceId])) {
        tmpRes = tmpRes.filter(e=>e.where.placeId==this.selectedPlaceId)
      }
      if (new MyUtil().isAllValueNotEmpty([this.selectedFriendId])) {
        tmpRes = tmpRes.filter(e=>e.who.friendId==this.selectedFriendId)
      }
      if (new MyUtil().isAllValueNotEmpty([this.tagsList])) {
        tmpRes = tmpRes.filter(e=>{
          return this.tagsList.filter(t=>{
            if (e.tags != undefined) {
              return e.tags.includes(t)
            }
          }).length == this.tagsList.length
        })
      }
      this.TLItemsList = tmpRes
      //
    }
  },
  methods: {
    removepost(postid) {
      this.$emit("removepost", postid)
    },
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
.TimeLine {
  width: 100%;
  height: 100%;
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
/*
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
*/
</style>
