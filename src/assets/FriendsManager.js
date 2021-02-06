import FirebaseManager from '../assets/FirebaseManager.js'
export default class FriendsManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
      this.FirebaseManager = new FirebaseManager(this.database)
      this.friendsinfoCache = null
      this.friendsgroupinfoCache = null
    }
    getNameFromFriendId(friendId) {
      var friendsInfo = this.friendsinfoCache
      var friendName = null
      if (friendsInfo != null) {
        Object.keys(friendsInfo).forEach(fid => {
          if (fid == friendId) {
            friendName = friendsInfo[fid].name
          }
        })
      }
      return friendName;
    }
    getNameFromFriendsGroupId(friendsGroupId) {
      var realFriendId = friendsGroupId.slice(5)
      var friendsInfo = this.friendsgroupinfoCache
      var friendName = null
      if (friendsInfo != null) {
        Object.keys(friendsInfo).forEach(fid => {
          if (fid == realFriendId) {
            friendName = friendsInfo[fid].name
          }
        })
      }
      return friendName;
    }
    friendidtoname(friendId) {
      return new Promise((resolve) => {
        if (friendId == undefined || friendId == null) {
          resolve(null);
        }
        // リストだったら...
        if (friendId.substr(0, 5) == "fg - ") {
          if (this.friendsgroupinfoCache == null) {
            this.fetchfriendsgroup().then(()=>{
              resolve(this.getNameFromFriendsGroupId(friendId))
            })
          } else {
            resolve(this.getNameFromFriendsGroupId(friendId))
          }
        } else {
          if (this.friendsinfoCache == null) {
            this.fetchsavedfriends().then(()=>{
              resolve(this.getNameFromFriendId(friendId))
            })
          } else {
            resolve(this.getNameFromFriendId(friendId))
          }
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
        this.FirebaseManager.on("friends/"+this.userInfo.uid).then((snapshot) =>{
          this.friendsinfoCache = snapshot
          resolve(snapshot)
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
        this.FirebaseManager.on("friendsGroup/"+this.userInfo.uid).then((snapshot) =>{
          // firebaseから取得できるのは名前がないデータなので、名前を追加で取得して返却する
          var returnObj = {}
          var groupInfo = snapshot
          this.friendsgroupinfoCache = snapshot
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