export default class PostsManager {
    constructor(arg_axios, arg_database, arg_userinfo, arg_pm, arg_fm) {
      this.axios = arg_axios
      this.database = arg_database
      this.userInfo = arg_userinfo
      this.PM = arg_pm
      this.FM = arg_fm
    }
    savepost(Obj) {
      return new Promise((resolve) => {
        this.database.ref("posts/"+this.userInfo.uid).push(Obj).then(() => {
          resolve(true)
        })
      })
    }
    getpostfromid(postid) {
      return new Promise((resolve) => {
        this.database.ref("posts/"+this.userInfo.uid+"/"+postid).on('value', (snapshot) =>{
          resolve(snapshot.val())
        })
      })
    }
    updatepost(postid, diffObjs) {
      return new Promise((resolve) => {
        this.database.ref("posts/"+this.userInfo.uid+"/"+postid).update(diffObjs).then(() => {
          resolve(true)
        })
      })
    }
    fetchallposts() {
      return new Promise((resolve) => {
        this.database.ref("posts/"+this.userInfo.uid).on('value', (snapshot) =>{
          resolve(snapshot.val())
        })
      })
    }
    fetchalltags() {
      return new Promise((resolve) => {
        this.fetchallposts().then(res=>{
          var allTags = Object.keys(res).map(postid => res[postid].tags)
          if (allTags.length != 0) {
            allTags = allTags.flat().unique().filter(Boolean)
          }
          resolve(allTags)
        })
      })
    }
    makeArrayWithNames(snapshots) {
      return new Promise((resolve) => {
        var snapshotslength = Object.keys(snapshots).length
        var postsList = []
        Object.keys(snapshots).forEach(postid => {
          var itemObj = snapshots[postid]
          //nameを取得していく
          var placeNamePromise = this.PM.placeidtoname(itemObj.where)
          var friendNamePromise = this.FM.friendidtoname(itemObj.who)
          Promise.all([placeNamePromise, friendNamePromise]).then((names) => {
            var placeName = names[0]
            var friendName = names[1]
            var returnObj = itemObj
            returnObj["postid"] = postid
            returnObj["imgUrls"] = itemObj.imgUrls?itemObj.imgUrls:null
            returnObj["where"] = {
              "placeId": itemObj.where,
              "name": placeName
            }
            returnObj["who"] = {
              "friendId": itemObj.who,
              "name": friendName
            }
            /*
            var returnObj = {
              postid: postid,
              imgUrls: itemObj.imgUrls?itemObj.imgUrls:null,
              what: itemObj.what,
              when: itemObj.when,
              where: {
                "placeId": itemObj.where,
                "name": placeName
              },
              who: {
                "friendId": itemObj.who,
                "name": friendName
              }
            }
            */
            postsList.push(returnObj)
            // 全件処理が完了したら実行
            if (snapshotslength == postsList.length) {
              resolve(postsList)
            }
          })
        })
      })
    }
  }