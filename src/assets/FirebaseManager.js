export default class FirebaseManager {
  constructor(arg_database) {
    this.database = arg_database
    this.cache = []
  }
  on(path) {
    return new Promise((resolve) => {
      var cache = this.cache[path]
      if (cache == undefined) {
        this.database.ref(path).on('value', (snapshot) =>{
          //console.warn("firebase access", path)
          this.cache[path] = snapshot.val()
          resolve(snapshot.val())
        })
      } else {
        resolve(cache)
      }
    })
  }
}