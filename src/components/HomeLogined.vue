<template>
  <div class="HomeLogined">
    <div class="HomeLogined__ColumnLeftArea">
      <div class="HomeLogined__ColumnLeftArea__HeaderArea"><div class="HomeLogined__ColumnLeftArea__HeaderArea__title">Diary</div><div class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton"><img src="/img/more_horiz-white-48dp/2x/outline_more_horiz_white_48dp.png" class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton__img"></div></div>
      <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">絞り込む ({{this.postsList.length}}件中{{this.TLItemsListDisp.length}}件表示中)</div>
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromKeywordArea"><input type="text" v-model="searchQueryText" placeholder="キーワードを入力 (例: 伊豆旅行2021)"></div>
        <!--<hr class="HomeLogined__ColumnLeftArea__ReviewthedayArea__hr">-->
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea">
          <div class="icon_img_conteiner">日付:{{this.selectedDate}} <img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" class="icon_img icon_clickable" v-show="this.selectedDate!=null" v-on:click="()=>{ this.selectedDate = null; this.filteringPosts() }"></div>
          <div class="icon_img_conteiner">場所:{{this.selectedPlaceName}} <img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" class="icon_img icon_clickable" v-show="this.selectedPlaceId!=null" v-on:click="()=>{ this.selectedPlaceId = null; this.selectedPlaceName = null; this.filteringPosts() }"></div>
          <div class="icon_img_conteiner">人物:{{this.selectedFriendName}} <img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" class="icon_img icon_clickable" v-show="this.selectedFriendId!=null" v-on:click="()=>{ this.selectedFriendId = null; this.selectedFriendName = null; this.filteringPosts() }"></div>
          <div>タグ:<div class="tag__wrapper" v-for="tag in tagsList" :key="tag"><div class="icon_img_conteiner">#{{tag}}<img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" class="icon_img icon_clickable" v-on:click="onTagClicked"></div></div></div>
          <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs tabs">
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__date tabs__wrapper" v-on:click="onClickTab(0)" v-bind:class="{'tabs__wrapper--active': activeNum === 0}"><div class="tabs__wrapper__items"><img src="/img/watch_later-black-48dp/2x/outline_watch_later_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">日時</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__tag tabs__wrapper tabs__wrapper--border" v-on:click="onClickTab(1)" v-bind:class="{'tabs__wrapper--active': activeNum === 1}"><div class="tabs__wrapper__items"><img src="/img/sell-black-48dp/2x/outline_sell_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">タグ</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__place tabs__wrapper tabs__wrapper--border" v-on:click="onClickTab(2)" v-bind:class="{'tabs__wrapper--active': activeNum === 2}"><div class="tabs__wrapper__items"><img src="/img/location_on-black-48dp/2x/baseline_location_on_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">場所</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__friends tabs__wrapper" v-on:click="onClickTab(3)" v-bind:class="{'tabs__wrapper--active': activeNum === 3}"><div class="tabs__wrapper__items"><img src="/img/group-black-48dp/2x/outline_group_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">人物</p></div></div>
          </div>
          <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__contents">
            <div v-show="activeNum === 0"><DatePicker :available-dates="availableDates" :attributes="calenderAttrs" v-model='SelectedDateOnCalendar' /></div>
            <div v-show="activeNum === 1">
              <ul>
                <li v-for="(tag, index) in tagSuggestList"><button class="tagSuggestButton" v-on:click="onAddTagButton(tag)" :ref="'tagSuggest_'+index">#{{tag}}</button></li>
              </ul>
            </div>
            <div v-show="activeNum === 2">
              <ul>
                <li v-for="(name, id) in placesInPostsList"><label><input type="radio" v-model="selectedPlaceId" :value="id">{{name}}</label></li>
              </ul>
            </div>
            <div v-show="activeNum === 3">
              <ul>
                <li v-for="(info, id) in friendsList"><label><input type="radio" v-model="selectedFriendId" :value="id">{{info.name}}</label></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <modal class="HomeLogined__modal" name="modal-editpostlist" :clickToClose="true" height="95%">
      <div class="HomeLogined__modal__contents">
        <h1 class="HomeLogined__modal__contents__title">投稿まとめを作成</h1>
        <div class="HomeLogined__modal__contents__div">
          <h2 class="HomeLogined__modal__contents__title">タイトル</h2>
          <input type="text" v-model="PostListName">
        </div>
        <div class="HomeLogined__modal__contents__div">
          <h2 class="HomeLogined__modal__contents__title">このまとめに含まれる投稿数: {{this.TLItemsList.length}}件</h2>
        </div>
        <div class="HomeLogined__modal__contents__div">
          <h2 class="HomeLogined__modal__contents__title">公開範囲設定</h2>
          <div class="editpostlist__body__signined__publicconf">
            <label><input type="radio" v-model="listPublicStatus" value="public">公開</label>
            <label><input type="radio" v-model="listPublicStatus" value="private">非公開</label>
          </div>
        </div>
        <div class="HomeLogined__modal__contents__div">
          <button v-on:click="onPostListSubmit">保存</button>
        </div>
      </div>
    </modal>
    <div class="HomeLogined__MainArea">
      <div class="HomeLogined__MainArea__buttons">
        <div><img src="/img/create_new_folder-black-48dp/2x/outline_create_new_folder_black_48dp.png" class="HomeLogined__MainArea__buttons__button" v-on:click="openPostListModal"></div>
        <div><img src="/img/edit-black-48dp/2x/outline_edit_black_48dp.png" class="HomeLogined__MainArea__buttons__button" v-on:click="gotoRegist"></div>
      </div>
      <TimeLine :propsPosts="postsList" :propsPostsOrderedbyDateList="postsOrderedbyDateList" :propsParams="filteringParams" :propsNotFoundMes="notFoundMes" propsIsOwner=true @removepost='removepost' @onChangedDispItem="onChangedDispItem"></TimeLine>
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
import TimeLine from '@/components/TimeLine.vue'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

export default {
  name: 'HomeLogined',
  components: {
    DatePicker,
    TimeLine
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
      selectedPlaceName: null,
      selectedFriendName: null,
      TLItemsList: [],
      TLItemsListDisp: [],
      postsList: [],
      postsOrderedbyDateList: [],
      placesInPostsList: {},
      friendsList: {},
      calenderAttrs: [],
      availableDates: [],
      tagsList: [],
      tagSuggestList: [],
      SelectedDateOnCalendar: null,
      selectedDate: null,
      selectedFriendId: null,
      searchQueryText: null,
      notFoundMes: "今日はまだ投稿がありません",
      PostListName: null,
      listPublicStatus: "public",
      filteringParams: null
    }
  },
  watch: {
    userInfo(after, before) {
      if (this.userInfo != null) {
        this.initMain()
      }
    },
    SelectedDateOnCalendar(e) {
      console.log(e)
      this.selectedDate = formatISO(e).split("T")[0]
      this.filteringPosts()
    },
    selectedPlaceId() {
      this.selectedPlaceName = this.placesInPostsList[this.selectedPlaceId]
      this.filteringPosts()
    },
    selectedFriendId() {
      this.selectedFriendName = this.friendsList[this.selectedFriendId].name
      this.filteringPosts()
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
      this.filteringPosts()
    },
    tagsList() {
      this.filteringPosts()
      this.onTagsListChange()
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
        database.ref("posts/"+this.userInfo.uid+"/"+postid).remove().then(()=>{
          // reload処理
          this.PSM.fetchallposts().then((tlitems)=>{
            this.PSM.makeArrayWithNames(tlitems).then((res)=>{
              this.postsList = res
              this.genPostsOrderedbyDateList()
              this.filteringPosts()
            })
          })
          alert('削除しました！')
        })
      })
    },
    onChangedDispItem(item) {
      this.TLItemsList = item
    },
    initMain() {
      this.PM = new PlacesManager(axios, database, this.userInfo)
      this.FM = new FriendsManager(axios, database, this.userInfo)
      this.PSM = new PostsManager(axios, database, this.userInfo, this.PM, this.FM)

      /*
      this.PM.savemyplace("pid_176ab0152cb183", {name: "自宅"}).then(() => {
        console.log("saved!", placeId)
      })
      .catch((error) => {
        console.log("Firebase Error", error)
      })
      */

      this.PSM.fetchallposts().then((tlitems)=>{
        this.PSM.makeArrayWithNames(tlitems).then((res)=>{
          this.postsList = res
          // 日付ごとに分けた配列を生成
          this.genPostsOrderedbyDateList()
          // 今日のものがあったらそれを表示
          var today = formatISO(new Date()).split("T")[0]
          this.selectedDate = today
          var todayPosts = this.postsOrderedbyDateList[today]
          if (todayPosts != undefined) {
            //this.TLItemsList = todayPosts
            this.filteringPosts()
            this.changeMes()
          }
          //カレンダーに印を表示
          this.genCalenderDots()
          // タグを準備
          this.PSM.fetchalltags().then((res)=>{
            this.tagSuggestList = res.map(e=>e.name)
              //描画が終わったら
              this.$nextTick(function() {
                this.onTagsListChange()
              })
            })
          //場所を取得
          this.genPlacesList()
          //フレンドを取得
          this.genFriendsList()
          // パラメータが指定されていたらそのリストの条件を絞り込みの条件に設定
          if (new MyUtil().isAllValueNotEmpty([this.$route.query.listid])) {
            // ListIDが指定されていたとき
            database.ref("postlist/"+this.userInfo.uid+"/"+this.$route.query.listid).on('value', (snapshot) =>{
              // パラメータをいいかんじに設定
              var prms = snapshot.val().parms
              this.selectedDate = null
              Object.keys(prms).forEach(k => {
                if (k == "keyword") {
                  this.searchQueryText = prms[k]
                } else if (k == "when") {
                  this.selectedDate = prms[k]
                  // TODO: SelectedDateOnCalendarを設定
                  //this.SelectedDateOnCalendar = prms[k]
                } else if (k == "where") {
                  this.selectedPlaceId = prms[k]
                } else if (k == "who") {
                  this.selectedFriendId = prms[k]
                } else if (k == "tags") {
                  this.tagsList = prms[k]
                }
              })
              this.filteringPosts()
            })
          } else if (new MyUtil().isAllValueNotEmpty([this.$route.query.placeid])) {
            // PlaceIDが指定されていたとき
            this.selectedPlaceId = this.$route.query.placeid
            this.filteringPosts()
          }
          //
        })
      })
    },
    genPostsOrderedbyDateList() {
      this.postsOrderedbyDateList = this.PSM.makeArrayOrderedbyDate(this.postsList)
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
    filteringPosts() {
      this.filteringParams = {
        "keyword": this.searchQueryText,
        "when": this.selectedDate,
        "where": this.selectedPlaceId,
        "who": this.selectedFriendId,
        "tags": this.tagsList
      }
      this.changeMes()
    },
    openPostListModal() {
      this.showModal("modal-editpostlist")
    },
    showModal(name) {
      this.$modal.show(name)
    },
    hideModal(name) {
      this.$modal.hide(name)
    },
    onPostListSubmit() {
      if (new MyUtil().isAllValueNotEmpty([this.PostListName, this.listPublicStatus, this.TLItemsList])) {
        var items = {
          "name": this.PostListName,
          "status": this.listPublicStatus,
          "thumbnail": this.TLItemsList.map(e=>e.imgUrls).flat().filter(Boolean)[0],
          "sincedate": Object.keys(this.TLItemsListDisp[0])[0],
          "untildate": Object.keys(this.TLItemsListDisp[this.TLItemsListDisp.length-1])[0],
          "parms":{
            "keyword": this.searchQueryText,
            "when": this.selectedDate,
            "where": this.selectedPlaceId,
            "who": this.selectedFriendId,
            "tags": this.tagsList
          }
        }
        // 値が設定されていないパラメータは削除する
        Object.keys(items).forEach(k=>{
          if (items[k] === null || items[k] === undefined) {
            delete items[k]
          } else {
            if (typeof items[k] === 'object') {
              Object.keys(items[k]).forEach(l=>{
                if (items[k][l] === null || items[k][l] === undefined || items[k][l].length == 0) {
                  delete items[k][l]
                }
              })
            }
          }
        })
        //
        database.ref("postlist/"+this.userInfo.uid).push(items).then(() => {
          alert("保存しました")
        })
      } else {
        alert("未入力の項目がある、またはまとめに含まれる投稿が0件の可能性があります")
      }
    },
    onTagClicked(e) {
      var text = e.target.parentElement.innerText.slice(1).replace(" ", "")
      var index = this.tagsList.indexOf(text)
      if (index > -1) {
        this.tagsList.splice(index, 1)
      }
    },
    onAddTagButton(tagval) {
      this.tagsList.push(tagval)
    },
    onTagsListChange() {
      for (var i=0;i<this.tagSuggestList.length;i++) {
        var button = this.$refs['tagSuggest_'+i][0]
        var value = button.innerText.slice(1)
        if (this.tagsList.includes(value)) {
          button.disabled = true
        } else {
          button.disabled = false
        }
      }

      this.dispPostList = []
      Object.keys(this.postsList).forEach(k => {
        var tags = this.postsList[k].tags
        if (tags != undefined) {
          var doubleCount = this.tagsList.filter(t=>tags.includes(t)).length   
          if (doubleCount == this.tagsList.length) {
            this.dispPostList.push(this.postsList[k])
          }
        }
      })
    },
  },
  mounted() {
    this.userInfo = this.propsUserInfo
    console.log("http://localhost:8080/user/"+this.userInfo.uid)
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
  &__modal {
    &__contents {
      padding: 20px;
      &__title {
        margin: 0 !important;
      }
      &__div {
        margin: 10px !important;
      }
    }
  }
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
          height: 300px;
          overflow: scroll;
        }
      }
    }
  }
  &__MainArea {
    padding-bottom: 60px;
    background-color: $main-mainarea-bg;
    overflow: hidden;
    &__buttons {
      position: absolute;
      bottom: 10px;
      right: 10px;
      &__button {
        width: 70px;
        height: 70px;
        &:hover {
          background-color: $icon-color-hover;
          border-radius: 0.25rem;
        }
      }
    }
  }
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  border-bottom: solid 5px $main-accent-color;
  &__wrapper {
    display: flex;
    justify-content: center; 
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
.tag__wrapper {
  display: inline-block;
  margin-right: 5px;
}
</style>
