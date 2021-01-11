<template>
  <div class="HomeLogined">
    <div class="HomeLogined__ColumnLeftArea">
      <div class="HomeLogined__ColumnLeftArea__HeaderArea"><div class="HomeLogined__ColumnLeftArea__HeaderArea__title">Diary</div><div class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton"><img src="/img/more_horiz-white-48dp/2x/outline_more_horiz_white_48dp.png" class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton__img"></div></div>
      <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">振り返る　({{this.postsList.length}}件中{{this.TLItemsList.length}}件表示中)</div>
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromKeywordArea"><input type="text" v-model="searchQueryText" placeholder="キーワードを入力 (例: 伊豆旅行2021)"></div>
        <hr class="HomeLogined__ColumnLeftArea__ReviewthedayArea__hr">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">絞り込む</div>
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
    <div class="HomeLogined__MainArea">
      <div class="HomeLogined__MainArea__postbutton">
        <button v-on:click="gotoRegist">投稿</button>
      </div>
      <div class="HomeLogined__MainArea__mesnopost" v-show="TLItemsListDisp.length==0">{{notFoundMes}}</div>
      <div class="HomeLogined__MainArea__Post" v-for="postsList in TLItemsListDisp">
        <div class="HomeLogined__MainArea__Post__Contents" v-for="(posts, day) in postsList">
          <div class="HomeLogined__MainArea__Post__Contents__title">{{day.replaceAll("-", "/")}}</div>
          <div v-for="post in posts"><TLItem :propsItem=post @removepost='removepost' :key="post.when" /></div>
        </div>
      </div>
    </div>
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
import MyUtil from '../assets/MyUtil.js'
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
      TLItemsListDisp: [],
      postsList: [],
      postsOrderedbyDateList: [],
      placesInPostsList: {},
      friendsList: {},
      calenderAttrs: [],
      availableDates: [],
      SelectedDateOnCalendar: null,
      selectedFriendId: null,
      searchQueryText: null,
      notFoundMes: "今日はまだ投稿がありません"
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
    },
    TLItemsList() {
      var dispPostIdsList = this.TLItemsList.map(e=>e.postid)
      this.TLItemsListDisp = []
      Object.keys(this.postsOrderedbyDateList).forEach(k=>{
        var placeItems = this.postsOrderedbyDateList[k]
        var filteredItems = placeItems.filter(e=>dispPostIdsList.includes(e.postid))
        if (filteredItems.length != 0) {
          this.TLItemsListDisp.push({[k]: filteredItems})
        }
      })
    },
    searchQueryText() {
      this.filteringPostsByQuery(this.searchQueryText)
    }
  },
  methods: {
    onClickTab(n) {
      this.activeNum = n
    },
    gotoRegist() {
      window.open('https://diary.tsumugu2626.xyz/regist')
    },
    removepost(postid) {
      new MyUtil().confirmExPromise("この投稿を本当に削除しますか?").then(() => {
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
            this.changeMes()
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
      // 中身を時系列にsort (デフォルトはDB書き込み順)
      Object.keys(this.postsOrderedbyDateList).forEach(date => {
        this.postsOrderedbyDateList[date].sort(function(a, b) {
          // 00:00:00 と 00:00 が混在してるので戦闘から4文字までにして合わせる
          const dateA = parseInt(a.when.split("T")[1].replace(":", "").slice(0, 4))
          const dateB = parseInt(b.when.split("T")[1].replace(":", "").slice(0, 4))
          if (dateA > dateB) {
            return 1;
          } else {
            return -1;
          }
        })
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
    genFriendsList() {
      this.friendsList = {}
      this.FM.fetchsavedfriends().then((res)=>{
        this.friendsList = res
      })
    },
    genPlacesList() {
      this.placesInPostsList = {}
      this.postsList.forEach(post => {
        if (post.where.name != undefined && post.where.placeId != undefined) {
          this.placesInPostsList[post.where.placeId] = post.where.name
        }
      })
    },
    changeMes() {
      this.notFoundMes = "検索結果はありません"
    },
    filteringPostsByQuery(text) {
      //キーワードでフィルタリング
      this.TLItemsList = this.postsList.filter(e=>new MyUtil().isObjectIncludeQureyText([e.what, e.where.name, e.who.name], text))
      this.changeMes()
    },
    filteringPostsByDate(date) {
      //日付でフィルタリング
      this.TLItemsList = this.postsOrderedbyDateList[date]
      this.changeMes()
    },
    filteringPostsByPlace(placeId) {
      //場所でフィルタリング
      this.TLItemsList = this.postsList.filter(e=>e.where.placeId==placeId)
      this.changeMes()
    },
    filteringPostsByFriends(friendsId) {
      //人物でフィルタリング
      this.TLItemsList = this.postsList.filter(e=>e.who.friendId==friendsId)
      this.changeMes()
    }
  },
  mounted() {
    this.userInfo = this.propsUserInfo
  }
}
</script>

<style scoped lang="scss">
.HomeLogined {
  display:grid;
  grid-template-columns: 450px 1fr;
  width: 100%;
  height: 100%;
  overflow: hidden;
  text-align: left;
  &__ColumnLeftArea {
    border: solid 1px $main-border;
    &__HeaderArea {
      display:grid;
      grid-template-columns: 1fr 30px;
      padding: 20px;
      color: $white;
      background-color: $main-headerarea-bg;
      &__title {
        font-size: 200%;
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
        font-size: 170%;
      }
      &__hr {
        margin: 20px 0 20px 0;
        border: solid 1px $main-border;
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
    padding: 20px;
    background-color: $main-mainarea-bg;
    overflow: scroll;
    &__postbutton {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }
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
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: solid 5px $main-accent-color;
  &__wrapper {
    margin: auto;
    padding: 0 27px 0 28.3px;
    border-radius: .25rem .25rem 0 0;
    &--border {
      border: solid $main-border;
      border-width: 0 1px 0 1px;
    }
    &--active{
      background-color: $main-accent-color;
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
        font-size: 120%;
        width: 40px;
        line-height: 0;
      }
    }
  }
}
.tabs__wrapper:hover:not(.tabs__wrapper--active) {
  background-color: $main-accent-color-hover;
}
</style>
