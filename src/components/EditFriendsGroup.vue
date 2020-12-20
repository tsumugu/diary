<template>
  <div class="EditFriendsGroup">
    <div>
      <div>
        <div v-for="(group, id) in friendsGroupList">
          <h1>{{group.name}}</h1>
          <ul v-for="friend in group.member"><li>{{friend.name}}</li></ul>
        </div>
      </div>
    </div>
    <hr>
    <div>
      <div>
        <input type="text" v-model="friendsGroupName">
      </div>
      <div>
        <div v-for="(name, id) in friendsList"><input type="checkbox" v-bind:id=id v-bind:value=id v-model="checkedFriendsGroupMemberList"><label v-bind:for=id>{{name.name}}</label></div>
      </div>
      <div>
        <button v-on:click="onSubmit">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import FriendsManager from '../assets/FriendsManager.js'

export default {
  name: 'EditFriendsGroup',
  props: {
    propsUserInfo: null
  },
  data() {
    return {
      userInfo: null,
      FM: null,
      checkedFriendsGroupMemberList: [],
      friendsGroupName: null,
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
      this.FM.savefriendsgroup(this.friendsGroupName, this.checkedFriendsGroupMemberList).then((result)=>{
        this.checkedFriendsGroupMemberList = []
        this.friendsGroupName = null
        this.FM.fetchfriendsgroup().then((result)=>{
          this.friendsGroupList = result
        })
        alert("保存成功!")
      })
      .catch((error)=>{
        console.log("FriendsManager Error", error)
      })
    }
  },
  mounted() {
    this.userInfo = this.propsUserInfo
  }
}
</script>

<style scoped lang="scss">
</style>
