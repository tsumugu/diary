import FirebaseManager from '../assets/FirebaseManager.js'
export default class FriendsManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
      this.FirebaseManager = new FirebaseManager(this.database)
    }
    friendidtoname(friendId) {
      return new Promise((resolve) => {
        if (friendId == undefined || friendId == null) {
          resolve(null);
        }
        // リストだったら...
        if (friendId.substr(0, 5) == "fg - ") {
          var realFriendId = friendId.slice(5)
          //this.database.ref("friendsGroup/"+this.userInfo.uid).on('value', (snapshot) =>{
          this.FirebaseManager.on("friendsGroup/"+this.userInfo.uid).then((snapshot) =>{
            var friendsInfo = snapshot
            //.val()
            var friendName = null
            if (friendsInfo != null) {
              Object.keys(friendsInfo).forEach(fid => {
                if (fid == realFriendId) {
                  friendName = friendsInfo[fid].name
                }
              })
            }
            resolve(friendName);
          })
        } else {
          //this.database.ref("friends/"+this.userInfo.uid).on('value', (snapshot) =>{
          this.FirebaseManager.on("friends/"+this.userInfo.uid).then((snapshot) =>{
            var friendsInfo = snapshot
            //.val()
            var friendName = null
            if (friendsInfo != null) {
              Object.keys(friendsInfo).forEach(fid => {
                if (fid == friendId) {
                  friendName = friendsInfo[fid].name
                }
              })
            }
            resolve(friendName);
          })
        }
      })
    }
    savemyfriend(friendName) {
      return new Promise((resolve, reject) => {
        this.database.ref("friends/"+this.userInfo.uid).push({"name":friendName}).then(() => {
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
    fetchsavedfriends() {
      return new Promise((resolve) => {
        //this.database.ref("friends/"+this.userInfo.uid).on('value', (snapshot) =>{
        this.FirebaseManager.on("friends/"+this.userInfo.uid).then((snapshot) =>{
          resolve(snapshot)
            //.val())
        })
      })
    }
    savefriendsgroup(friendsGroupName, friendsGroupMemberList) {
      return new Promise((resolve, reject) => {
        this.database.ref("friendsGroup/"+this.userInfo.uid).push({"name":friendsGroupName, "member": friendsGroupMemberList}).then(() => {
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
    fetchfriendsgroup() {
      return new Promise((resolve) => {
        //this.database.ref("friendsGroup/"+this.userInfo.uid).on('value', (snapshot) =>{
        this.FirebaseManager.on("friendsGroup/"+this.userInfo.uid).then((snapshot) =>{
          // firebaseから取得できるのは名前がないデータなので、名前を追加で取得して返却する
          var returnObj = {}
          var groupInfo = snapshot
          //.val()
          if (groupInfo != null) {
            Object.keys(groupInfo).forEach(gid => {
              var memberInfo = groupInfo[gid].member
              var memberListWithName = []
              Object.keys(memberInfo).forEach(fid => {
                this.friendidtoname(memberInfo[fid]).then((res)=>{
                  memberListWithName.push({
                    "id": memberInfo[fid],
                    "name": res
                  })
                })
              })
              returnObj[gid] = {
                member: memberListWithName,
                name: groupInfo[gid].name
              }
            })
          }
          resolve(returnObj)
        })
      })
    }
  }