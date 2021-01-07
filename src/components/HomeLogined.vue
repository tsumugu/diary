<template>
  <div class="HomeLogined">
    <div class="HomeLogined__ColumnLeftArea">
      <div class="HomeLogined__ColumnLeftArea__HeaderArea"><div class="HomeLogined__ColumnLeftArea__HeaderArea__title">Diary</div><div class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton"><img src="/img/more_horiz-white-48dp/2x/outline_more_horiz_white_48dp.png" class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton__img"></div></div>
      <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">キーワードで検索して振り返る</div>
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromKeywordArea"><input type="text" class="form-input mt-1 block w-full" placeholder="例: 伊豆旅行2021"><button>検索</button></div>
        <hr class="HomeLogined__ColumnLeftArea__ReviewthedayArea__hr">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">ジャンルから振り返る</div>
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea">
          <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs tabs">
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__date tabs__wrapper" v-on:click="onClickTab(0)" v-bind:class="{'tabs__wrapper--active': activeNum === 0}"><div class="tabs__wrapper__items"><img src="/img/watch_later-black-48dp/2x/outline_watch_later_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">日時</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__place tabs__wrapper tabs__wrapper--border" v-on:click="onClickTab(1)" v-bind:class="{'tabs__wrapper--active': activeNum === 1}"><div class="tabs__wrapper__items"><img src="/img/explore-black-48dp/2x/outline_explore_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">場所</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__friends tabs__wrapper" v-on:click="onClickTab(2)" v-bind:class="{'tabs__wrapper--active': activeNum === 2}"><div class="tabs__wrapper__items"><img src="/img/group-black-48dp/2x/outline_group_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">人物</p></div></div>
          </div>
          <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__contents">
            <div v-show="activeNum === 0"><DatePicker :available-dates="availableDates" :attributes="calenderAttrs" v-model='SelectedDateOnCalendar' /></div>
            <div v-show="activeNum === 1">
              <ul>
                <li v-for="(name, id) in placesInPostsList"><label><input type="radio" v-model="selectedPlaceId" :value="id">{{name}}</label></li>
              </ul>
            </div>
            <div v-show="activeNum === 2">
              <ul>
                <li v-for="(info, id) in friendsList"><label><input type="radio" v-model="selectedFriendId" :value="id">{{info.name}}</label></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="HomeLogined__MainArea"><div v-for="post in TLItemsList"><TLItem :propsItem=post @removepost='removepost' :key="post.when" /></div></div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import formatISO  from 'date-fns/formatISO'

import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import PostsManager from '../assets/PostsManager.js'
import TLItem from '@/components/TLItem.vue'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

export default {
  name: 'HomeLogined',
  components: {
    DatePicker,
    TLItem
  },
  props: {
    propsUserInfo: null
  },
  data() {
    return {
      userInfo: null,
      PM: null,
      FM: null,
      PSM: null,
      activeNum: 0,
      selectedPlaceId: null,
      TLItemsList: [],
      postsList: [],
      postsOrderedbyDateList: [],
      placesInPostsList: {},
      friendsList: {},
      calenderAttrs: [],
      availableDates: [],
      SelectedDateOnCalendar: null,
      selectedFriendId: null
    }
  },
  watch: {
    userInfo(after, before) {
      if (this.userInfo != null) {
        this.initMain()
      }
    },
    SelectedDateOnCalendar(e) {
      this.filteringPostsByDate(formatISO(e).split("T")[0])
    },
    selectedPlaceId() {
      this.filteringPostsByPlace(this.selectedPlaceId)
    },
    selectedFriendId() {
      this.filteringPostsByFriends(this.selectedFriendId)
    }
  },
  methods: {
    onClickTab(n) {
      this.activeNum = n
    },
    confirmExPromise(message) {
      if (window.confirm(message)) {
        return Promise.resolve();
      }
      return Promise.reject();
    },
    removepost(postid) {
      this.confirmExPromise("この投稿を本当に削除しますか?").then(() => {
        firebase.database().ref("posts/"+this.userInfo.uid+"/"+postid).remove().then(function(){
          alert('削除しました！')
          // reload処理
        })
      });
    },
    initMain() {
      this.PM = new PlacesManager(axios, database, this.userInfo)
      this.FM = new FriendsManager(axios, database, this.userInfo)
      this.PSM = new PostsManager(axios, database, this.userInfo, this.PM, this.FM)

      //firebase.database().ref("posts/"+this.userInfo.uid).on('value', (snapshot) =>{
      this.PSM.fetchallposts().then((tlitems)=>{
        this.PSM.makeArrayWithNames(tlitems).then((res)=>{
          this.postsList = res
          // 日付ごとに分けた配列を生成
          this.genPostsOrderedbyDateList()
          // 今日のものがあったらそれを表示
          var today = formatISO(new Date()).split("T")[0]
          var todayPosts = this.postsOrderedbyDateList[today]
          if (todayPosts != undefined) {
            this.TLItemsList = todayPosts
          }
          //カレンダーに印を表示
          this.genCalenderDots()
          //場所を取得
          this.genPlacesList()
          //フレンドを取得
          this.genFriendsList()
        })
      })
    },
    genPostsOrderedbyDateList() {
      this.postsOrderedbyDateList = {}
      this.postsList.forEach(post => {
        //var tmpDayString = post.when.split("T")[0].split("-").join("/")
        if (post.when != undefined) {
          var tmpDayString = post.when.split("T")[0]
          if (this.postsOrderedbyDateList[tmpDayString] == undefined) {
            this.postsOrderedbyDateList[tmpDayString] = []
          }
          this.postsOrderedbyDateList[tmpDayString].push(post)
        } else {
          // 日付は必須項目だが、バグで抜けていることがある。
          console.log("Something went wrong!", post)
        }
      })
    },
    genCalenderDots() {
      this.calenderAttrs = []
      this.availableDates = []
      this.calenderAttrs = [
        {
          key: 'postedDate',
          highlight: 'blue',
          dates: Object.keys(this.postsOrderedbyDateList).map(e=>new Date(e+"T00:00:00")),
        },
        {
          key: 'today',
          highlight: 'red',
          dates: new Date(),
        }
      ]
      Object.keys(this.postsOrderedbyDateList).map(e=>{
        this.availableDates.push({start: new Date(e+"T00:00:00"), end: new Date(e+"T00:00:00")})
      })
    },
    genPlacesList() {
      this.friendsList = {}
      this.FM.fetchsavedfriends().then((res)=>{
        this.friendsList = res
      })
    },
    genFriendsList() {
      this.placesInPostsList = {}
      //
      var localStoragePlaces = window.localStorage.getItem('places')
      if (localStoragePlaces != undefined) {
        this.placesInPostsList = JSON.parse(localStoragePlaces)
      } else {
        this.postsList.forEach(post => {
          //var tmpDayString = post.when.split("T")[0].split("-").join("/")
          if (post.where.name != undefined && post.where.placeId != undefined) {
            this.placesInPostsList[post.where.placeId] = post.where.name
          }
        })
        window.localStorage.setItem('places', JSON.stringify(this.placesInPostsList))
      }
    },
    filteringPostsByDate(date) {
      //日付でフィルタリング
      this.TLItemsList = this.postsOrderedbyDateList[date]
    },
    filteringPostsByPlace(placeId) {
      //場所でフィルタリング
      this.TLItemsList = this.postsList.filter(e=>e.where.placeId==placeId)
    },
    filteringPostsByFriends(friendsId) {
      //人物でフィルタリング
      this.TLItemsList = this.postsList.filter(e=>e.who.friendId==friendsId)
    }
  },
  mounted() {
    this.userInfo = this.propsUserInfo
  }
}
</script>

<style scoped lang="scss">
$white:  #ffffff;
$headerarea-bg: #BAB8B8;
$mainarea-bg: #F7F5F5;
$border: #b3b3b3;
$accent-color: pink;
.HomeLogined {
  display:grid;
  grid-template-columns: 450px 1fr;
  width: 100%;
  height: 100%;
  overflow: hidden;
  text-align: left;
  &__ColumnLeftArea {
    border: solid 1px $border;
    &__HeaderArea {
      display:grid;
      grid-template-columns: 1fr 30px;
      padding: 20px;
      color: $white;
      background-color: $headerarea-bg;
      &__title {
        font-size: 2rem;
      }
      &__menubutton {
        position: relative;
        &__img {
          width: 30px;
          height: 30px;

          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: auto;
        }
      }
    }
    &__ReviewthedayArea {
      padding: 20px 20px 20px 20px;
      &__title {
        font-size: 1.7rem;
      }
      &__hr {
        margin: 20px 0 20px 0;
        border: solid 1px $border;
      }
      &__ReviewFromGenleArea {
        &__contents {
          padding-top: 10px;
          /* TODO: レスポンシブに */
          height: 300px;
          overflow: scroll;
        }
      }
    }
  }
  &__MainArea {
    background-color: $mainarea-bg;
  }
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: solid 5px $accent-color;
  &__wrapper {
    margin: auto;
    padding: 0 27px 0 29px;
    &--border {
      border: solid $border;
      border-width: 0 1px 0 1px;
    }
    &--active{
      background-color: $accent-color;
    }
    &__items {
      display: grid;
      grid-template-columns: 40px 40px;
      padding: 10px 0 10px 0;
      &__img {
        width: 40px;
        height: 40px;
      }
      &__text {
        font-size: 1.2rem;
        width: 40px;
        line-height: 0;
      }
    }
  }
}
.tabs__wrapper:hover {
  background-color: $accent-color;
}
</style>
