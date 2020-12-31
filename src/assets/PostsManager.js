export default class PostsManager {
    constructor(arg_pm, arg_fm) {
      this.PM = arg_pm
      this.FM = arg_fm
    }
    makeArrayWithNames(snapshots) {
      return new Promise((resolve) => {
        var snapshotslength = Object.keys(snapshots).length
        var postsList = []
        Object.keys(snapshots).forEach(postid => {
          var itemObj = snapshots[postid]
          //
          var returnObj = {
            postid: postid,
            imgUrls: itemObj.imgUrls?itemObj.imgUrls:null,
            what: itemObj.what,
            when: itemObj.when,
            where: {
              "placeId": itemObj.where,
              "name": null
            },
            who: {
              "friendId": itemObj.who,
              "name": null
            }
          }
          postsList.push(returnObj)
          // 全件処理が完了したら実行
          if (snapshotslength == postsList.length) {
            resolve(postsList)
          }
          //
          //nameを取得していく
          /*
          var placeNamePromise = this.PM.placeidtoname(itemObj.where)
          var friendNamePromise = this.FM.friendidtoname(itemObj.who)
          Promise.all([placeNamePromise, friendNamePromise]).then((names) => {
            var placeName = names[0]
            var friendName = names[1]
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
            postsList.push(returnObj)
            // 全件処理が完了したら実行
            if (snapshotslength == postsList.length) {
              resolve(postsList)
            }
          })
          */
        })
      })
    }
  }