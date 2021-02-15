import FirebaseManager from '../assets/FirebaseManager.js'
export default class PostsManager {
    constructor(arg_axios, arg_database, arg_userinfo, arg_pm, arg_fm) {
      this.axios = arg_axios
      this.database = arg_database
      this.userInfo = arg_userinfo
      this.FirebaseManager = new FirebaseManager(this.database)
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
        this.FirebaseManager.on("posts/"+this.userInfo.uid+"/"+postid).then((snapshot) =>{
          resolve(snapshot)
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
        this.FirebaseManager.on("posts/"+this.userInfo.uid).then((snapshot) =>{
          resolve(snapshot)
        })
      })
    }
    countTags(posts, limit) {
      if (posts == null || posts == undefined) {
        return []
      } else {
        var tagsinpostList = []
        Object.keys(posts).forEach(k => {
          var e = posts[k]
          if (e.tags!=undefined) {
            tagsinpostList.push(e.tags)
          }
        })
        var tmpTagsCountList = []
        tagsinpostList.forEach(e=>{
          e.forEach(f=>{
            if (tmpTagsCountList[f] == undefined) {
              tmpTagsCountList[f] = 0
            }
            tmpTagsCountList[f] += 1
          })
        })
        var tagscountList = []
        Object.keys(tmpTagsCountList).forEach(k => {
          tagscountList.push({
            name: k,
            count: tmpTagsCountList[k]
          })
        })
        tagscountList.sort(function(a, b) {
          if (a.count < b.count) {
            return 1
          } else {
            return -1
          }
        })
        if (limit != null) {
          if (tagscountList.length>=limit) {
            tagscountList = tagscountList.splice(0, limit)
          }
        }
        return tagscountList
      }
    }
    fetchalltags(limit=null, posts=null) {
      return new Promise((resolve) => {
        if (posts!=null) {
          resolve(this.countTags(posts, limit))
        } else {
          this.fetchallposts().then(res=>{
            resolve(this.countTags(res, limit))
          })
        }
      })
    }
    makeArrayWithNames(snapshots) {
      return new Promise((resolve) => {
        if (snapshots == null || snapshots == undefined) {
          resolve([])
        } else {
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
              postsList.push(returnObj)
              // 全件処理が完了したら実行
              if (snapshotslength == postsList.length) {
                resolve(postsList)
              }
            })
          })
        }
      })
    }
    makeArrayOrderedbyDate(postsList) {
      var postsOrderedbyDateList = {}
      postsList.forEach(post => {
        if (post.when != undefined) {
          var tmpDayString = post.when.split("T")[0]
          if (postsOrderedbyDateList[tmpDayString] == undefined) {
            postsOrderedbyDateList[tmpDayString] = []
          }
          postsOrderedbyDateList[tmpDayString].push(post)
        } else {
          // 日付は必須項目だが、バグで抜けていることがある。
          console.log("Something went wrong!", post)
        }
      })
      if (postsOrderedbyDateList.length<=0) {
        return []
      }
      // 中身を時系列にsort (デフォルトはDB書き込み順)
      Object.keys(postsOrderedbyDateList).forEach(date => {
        postsOrderedbyDateList[date].sort(function(a, b) {
          // 00:00:00 と 00:00 が混在してるので先頭から4文字までにして合わせる
          const dateA = parseInt(a.when.split("T")[1].replace(":", "").slice(0, 4))
          const dateB = parseInt(b.when.split("T")[1].replace(":", "").slice(0, 4))
          if (dateA > dateB) {
            return 1;
          } else {
            return -1;
          }
        })
      })
      return postsOrderedbyDateList
    }
  }