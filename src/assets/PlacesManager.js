export default class PlacesManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
      this.axiosGetCache = {}
      var localStoragePlaces = window.localStorage.getItem('places')
      if (localStoragePlaces != undefined) {
        this.axiosGetCache = JSON.parse(localStoragePlaces)
      }
    }
    searchnearbyplacesbylatlon(lat, lon) {
      return this.axios.get('https://secure.tsumugu2626.xyz/placessearch/nearby.php?lat='+lat+'&lon='+lon)
    }
    searchplacesbyname(query) {
      return this.axios.get(encodeURI('https://secure.tsumugu2626.xyz/placessearch/name.php?q='+query))
    }
    searchplacesbyname(query) {
      return this.axios.get(encodeURI('https://secure.tsumugu2626.xyz/placessearch/name.php?q='+query))
    }
    savemyplace(placeId, placeName) {
      return new Promise((resolve, reject) => {
        this.database.ref("places/"+this.userInfo.uid+"/"+placeId).set({name: placeName}).then(() => {
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
    saveplaceinfo(placeid) {
    }
    getplaceinfo(placeid, info) {
      /*
      this.axios.get('https://secure.tsumugu2626.xyz/placessearch/idtoname.php?pid='+placeId).then((res)=>{
        resolve(res.data)
      })
      */
    }
    fetchusersavedplaces() {
      return new Promise((resolve) => {
        this.database.ref("places/"+this.userInfo.uid).on('value', (snapshot) =>{
          var placesinfo = snapshot.val()
          resolve(placesinfo)
        })
      })
    }
    saveLocalStorage(data) {
      window.localStorage.setItem('places', JSON.stringify(data))
    }
    getIDtoNameAPI(placeId) {
      return new Promise((resolve) => {
        if (this.axiosGetCache[placeId] == null) {
          this.axios.get('https://secure.tsumugu2626.xyz/placessearch/idtoname.php?pid='+placeId).then((res)=>{
            this.axiosGetCache[placeId] = res.data
            this.saveLocalStorage(this.axiosGetCache)
            resolve(res.data)
          })
        } else {
          resolve(this.axiosGetCache[placeId])
        }
      })
      //this.axiosGetCache
    }
    placeidtoname(placeId) {
      return new Promise((resolve) => {
        if (placeId == undefined || placeId == null) {
          resolve(null);
        }
        //placeIdの最初がpid_だったら
        if (placeId.substr(0, 4) == "pid_") {
          this.database.ref("places/"+this.userInfo.uid).on('value', (snapshot) =>{
            var placesInfo = snapshot.val()
            var placeName = null
            if (placesInfo != null) {
              Object.keys(placesInfo).forEach(pid => {
                if (pid == placeId) {
                  placeName = placesInfo[pid].name
                  this.axiosGetCache[pid] = placeName
                  this.saveLocalStorage(this.axiosGetCache)
                }
              })
            }
            if (placeName == null) {
              //
              this.getIDtoNameAPI(placeId).then((res)=>{
                resolve(res)
              })
            } else {
              resolve(placeName)
            }
          })
        } else {
          // GoogleのPlace IDなので、いい感じに変換
          this.getIDtoNameAPI(placeId).then((res)=>{
            resolve(res)
          })
        }
      })
    }
  }