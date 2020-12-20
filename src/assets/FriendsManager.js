export default class FriendsManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
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
        this.database.ref("friends/"+this.userInfo.uid).on('value', (snapshot) =>{
          var friedsinfo = snapshot.val()
          resolve(friedsinfo);
        })
      })
    }
    friendidtoname(friendId) {
      return new Promise((resolve) => {
        this.database.ref("friends/"+this.userInfo.uid).on('value', (snapshot) =>{
          var friendsInfo = snapshot.val()
          var friendName = null
          Object.keys(friendsInfo).forEach(fid => {
            if (fid == friendId) {
              friendName = friendsInfo[fid].name
            }
          })
          resolve(friendName);
        })
      })
    }
  }