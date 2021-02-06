export default class FirebaseManager {
  constructor(arg_database) {
    this.database = arg_database
  }
  on(path) {
    return new Promise((resolve) => {
      // Session Storageに保存されているか確認
      var cache = sessionStorage.getItem(path)
      if (cache == undefined) {
        this.database.ref(path).on('value', (snapshot) =>{
          //console.warn("firebase access", path)
          sessionStorage.setItem(path, JSON.stringify(snapshot.val()))
          resolve(snapshot.val())
        })
      } else {
        resolve(cache)
      }
    })
  }
}
/*
export default class FirebaseManager {
  constructor(arg_database) {
    this.database = arg_database
    this.cache = []
  }
  on(path) {
    return new Promise((resolve) => {
      // Session Storageに保存されているか確認
      var cache = this.cache[path]
      if (cache == undefined) {
        this.database.ref(path).on('value', (snapshot) =>{
          console.warn("firebase access", path)
          this.cache[path] = snapshot.val()
          resolve(snapshot.val())
        })
      } else {
        //console.warn("use cache", this.cache)
        resolve(cache)
      }
    })
  }
}
*/