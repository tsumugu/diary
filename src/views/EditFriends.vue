<template>
  <div class="editfriends">
    <div class="editfriends__loading" v-if="isNowLoading"><!-- Loading --></div>
      <div class="editfriends__body" v-else>
        <div class="editfriends__body__signined" v-if="isSignIn">
          <modal name="modal-editfriends" :clickToClose="true" height="95%">
            <div style="padding: 20px;">
              <div>
                <h2>名前編集</h2>
                <input type="text" v-model="friendName">
              </div>
              <div>
                <button v-on:click="onSubmit">保存</button>
              </div>
            </div>
          </modal>
          <div>
            <h1>フレンド追加</h1>
            <input type="text" v-model="whoAdd" /><button v-on:click="onClickedAddWhoButton">+</button>
          </div>
          <div>
            <h1>フレンド一覧</h1>
            <ul>
              <li v-for="(friend, id) in friendsList">
                <div class="editfriends__body__signined__listitem"><p>{{friend.name}}</p><img src="/img/edit-black-48dp/2x/outline_edit_black_48dp.png" v-on:click="onClickedEditButton(id)"><img src="/img/delete-black-48dp/2x/outline_delete_black_48dp.png" v-on:click="onClickedDeleteButton(id)"></div>
              </li>
            </ul>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import FriendsManager from '../assets/FriendsManager.js'
import MyUtil from '../assets/MyUtil.js'

export default {
  name: "editfriends",
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      FM: null,
      friendName: null,
      friendsId: null,
      friendsList: [],
      whoAdd: null
    }
  },
  watch: {
    userInfo(after, before) {
      if (this.userInfo != null) {
        this.initMain()
      }
    }
  },
  methods: {
    initMain() {
      this.FM = new FriendsManager(axios, database, this.userInfo)
      this.FM.fetchsavedfriends().then((result)=>{
        this.friendsList = result
      })
    },
    onSubmit() {
      if (!new MyUtil().isAllValueNotEmpty([this.friendName])) {
        alert("名前を入力してください")
        return false
      }
      this.FM.updatefriendname(this.friendsId, this.friendName).then((result)=>{
        this.FM.fetchsavedfriends().then((result)=>{
          this.friendsList = result
        })
        alert("保存しました")
        this.$modal.hide("modal-editfriends")
      })
      .catch((error)=>{
        console.log("FriendsManager Error", error)
      })
    },
    onClickedEditButton(friendid) {
      this.friendName = this.friendsList[friendid].name
      this.friendsId = friendid
      this.$modal.show("modal-editfriends")
    },
    onClickedDeleteButton(friendid) {
      new MyUtil().confirmExPromise("このフレンドを本当に削除しますか?").then(() => {
        /*
        this.FM.removefriend(friendid).then(()=>{
        */
        this.FM.updatefriendname(friendid, "【削除済み】").then((result)=>{
          this.FM.fetchsavedfriends().then((result)=>{
            this.friendsList = result
          })
          alert('削除しました！')
        })
      });
    },
    onClickedAddWhoButton() {
      this.FM.savemyfriend(this.whoAdd).then(() => {
        this.whoAdd = null
        this.FM.fetchsavedfriends().then((result)=>{
          this.friendsList = result
        })
        alert("追加しました！")
      })
      .catch((error) => {
        //onError
        console.log("Firebase Error", error)
      })
    }
  },
  mounted() {
    //ログイン状況を確認
    const _this = this
    firebase.auth().onAuthStateChanged(user => {
      _this.isSignIn = (user != null)
      _this.userInfo = user
      _this.isNowLoading = false
    })
  }
}
</script>

<style scoped lang="scss">
h1, h2, p, ul {
  margin: 0;
}
.editfriends {
  width: 100%;
  height: 100%;
  &__loading {
    width: 100%;
    height: 100%;
  }
  &__body {
    width: 100%;
    height: 100%;
    &__signined {
      width: 100%;
      height: 100%;
      &__listitem {
        display: flex;
        justify-content: center;
        align-items: center;
        & > img {
          width: 1.5rem;
          height: 1.5rem;
          &:hover {
            background-color: $icon-color-hover;
            border-radius: 0.25rem;
          }
        }
        & > h2 {
          display: inline-block;
        }
      }
    }
  }
}
</style>