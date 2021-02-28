<template>
  <div class="editfriendslist">
    <div class="editfriendslist__loading" v-if="isNowLoading"><!-- Loading --></div>
      <div class="editfriendslist__body" v-else>
        <div class="editfriendslist__body__signined" v-if="isSignIn">
          <button v-on:click="onClickedMakeListButton">グループ新規作成</button>
          <modal name="modal-makefriendslist" :clickToClose="true" width="95%" height="95%">
            <div style="padding: 20px;">
              <div style="height:40px;text-align:left;"><img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" v-on:click='()=>{this.$modal.hide("modal-makefriendslist")}' class="icon_clickable" style="width:40px;height:40px;"></div>
              <h1>{{isMakeListMode?"グループ新規作成":"グループ編集"}}</h1>
              <div>
                <h2>タイトル</h2>
                <input type="text" v-model="friendsGroupName">
              </div>
              <div>
                <h2>メンバーを選択</h2>
                <div v-for="(name, id) in friendsList"><input type="checkbox" v-bind:id=id v-bind:value=id v-model="checkedFriendsGroupMemberList"><label v-bind:for=id>{{name.name}}</label></div>
              </div>
              <div>
                <button v-on:click="onSubmit">{{isMakeListMode?"作成":"保存"}}</button>
              </div>
            </div>
          </modal>
          <div>
            <h1>フレンドグループ一覧</h1>
            <div v-for="(group, id) in friendsGroupList">
              <div class="editfriendslist__body__signined__listitem"><h2>{{group.name}}</h2><img src="/img/edit-black-48dp/2x/outline_edit_black_48dp.png" v-on:click="onClickedEditButton(id)"><img src="/img/delete-black-48dp/2x/outline_delete_black_48dp.png" v-on:click="onClickedDeleteButton(id)"></div>
              <ul>
                <li v-for="friend in group.member">{{friend.name}}</li>
              </ul>
            </div>
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
  name: "editfriendslist",
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      isMakeListMode: true,
      FM: null,
      checkedFriendsGroupMemberList: [],
      friendsGroupName: null,
      friendsGroupId: null,
      friendsList: [],
      friendsGroupList: []
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
      this.FM.fetchfriendsgroup().then((result)=>{
        this.friendsGroupList = result
      })
    },
    onSubmit() {
      //
      if (!new MyUtil().isAllValueNotEmpty([this.friendsGroupName]) && !new MyUtil().isAllValueNotEmpty([this.checkedFriendsGroupMemberList])) {
        alert("タイトルを入力してください, メンバーは最低1人選択してください")
        return false
      }
      if (!new MyUtil().isAllValueNotEmpty([this.friendsGroupName])) {
        alert("タイトルを入力してください")
        return false
      }
      if (!new MyUtil().isAllValueNotEmpty([this.checkedFriendsGroupMemberList])) {
        alert("メンバーは最低1人選択してください")
        return false
      }
      //
      var promise = null
      if (this.isMakeListMode) {
        promise = this.FM.savefriendsgroup(this.friendsGroupName, this.checkedFriendsGroupMemberList)
      } else {
        promise = this.FM.updatefriendsgroup(this.friendsGroupId, this.friendsGroupName, this.checkedFriendsGroupMemberList)
      }
      if (promise != null) {
        promise.then((result)=>{
          this.checkedFriendsGroupMemberList = []
          this.friendsGroupName = null
          this.FM.fetchfriendsgroup().then((result)=>{
            this.friendsGroupList = result
          })
          alert(this.isMakeListMode?"作成しました":"保存しました")
          this.$modal.hide("modal-makefriendslist")
        })
        .catch((error)=>{
          console.log("FriendsManager Error", error)
        })
      }
    },
    onClickedMakeListButton() {
      this.isMakeListMode = true
      this.friendsGroupName = null
      this.checkedFriendsGroupMemberList = []
      this.$modal.show("modal-makefriendslist")
    },
    onClickedEditButton(listid) {
      this.isMakeListMode = false
      // formを埋める
      this.friendsGroupId = listid
      this.friendsGroupName = this.friendsGroupList[listid].name
      this.checkedFriendsGroupMemberList = this.friendsGroupList[listid].member.map(e=>e.id)
      //
      this.$modal.show("modal-makefriendslist")
    },
    onClickedDeleteButton(listid) {
      new MyUtil().confirmExPromise("このグループを本当に削除しますか?").then(() => {
        this.FM.removefriendsgroup(listid).then(()=>{
          this.FM.fetchfriendsgroup().then((result)=>{
            this.friendsGroupList = result
          })
          alert('削除しました！')
        })
      });
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
h1, h2, ul {
  margin: 0;
}
.editfriendslist {
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