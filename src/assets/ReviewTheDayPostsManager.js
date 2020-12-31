export default class ReviewTheDayPostsManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
    }
    savepost(Obj) {
      return new Promise((resolve, reject) => {
        this.database.ref("reviewthedayposts/"+this.userInfo.uid).push(Obj).then(() => {
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
    updatepost(diffObjs, postid) {
      return new Promise((resolve, reject) => {
        this.database.ref("reviewthedayposts/"+this.userInfo.uid+"/"+postid).update(diffObjs).then(() => {
          resolve(true)
        })
        .catch((error) => {
          //onError
          reject(error)
        })
      })
    }
    fetchallposts() {
      return new Promise((resolve) => {
        this.database.ref("reviewthedayposts/"+this.userInfo.uid).on('value', (snapshot) =>{
          resolve(snapshot.val())
        })
      })
    }
  }