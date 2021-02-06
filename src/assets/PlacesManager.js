import FirebaseManager from '../assets/FirebaseManager.js'
export default class PlacesManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
      this.placesinfoCache = null
      this.FirebaseManager = new FirebaseManager(this.database)
    }
    searchnearbyplacesbylatlon(lat, lon) {
      return this.axios.get('https://secure.tsumugu2626.xyz/placessearch/nearby.php?lat='+lat+'&lon='+lon)
    }
    searchplacesbyname(query) {
      return this.axios.get(encodeURI('https://secure.tsumugu2626.xyz/placessearch/name.php?q='+query))
    }
    savemyplace(placeId, placeInfo) {
      return new Promise((resolve, reject) => {
        if (typeof placeInfo === 'object') {
          this.database.ref("places/"+this.userInfo.uid+"/"+placeId).set(placeInfo).then(() => {
            resolve(true)
          })
          .catch((error) => {
            reject(error)
          })
        } else {
          reject("Not Valid Prms")
        }
      })
    }
    fetchusersavedplaces() {
      return new Promise((resolve) => {
        this.FirebaseManager.on("places/"+this.userInfo.uid).then((snapshot) =>{
          var placesinfo = snapshot
          /*
          //もし経度緯度が設定されていなかったら設定する
          var placeids = Object.keys(placesinfo)
          placeids.forEach(pid=>{
            if ((placesinfo[pid].lat==undefined||placesinfo[pid].lon==undefined)&&pid.slice(0, 4)!="pid_") {
              this.getIDtoLocationAPI(pid).then((res)=>{
                console.log("Places Manager Info", "Location Not Found => "+pid)
                this.database.ref("places/"+this.userInfo.uid+"/"+pid).update(res)
              })
            }
          })
          */
          this.placesinfoCache = placesinfo
          resolve(placesinfo)
        })
      })
    }
    getIDtoNameAPI(placeId) {
      return new Promise((resolve) => {
        this.axios.get('https://secure.tsumugu2626.xyz/placessearch/idtoname.php?pid='+placeId).then((res)=>{
          resolve(res.data)
        })
      })
    }
    getIDtoLocationAPI(placeId) {
      return new Promise((resolve) => {
        this.axios.get('https://secure.tsumugu2626.xyz/placessearch/idtolatlon.php?pid='+placeId).then((res)=>{
          resolve(res.data)
        })
      })
    }
    getNameFromPlaceId(placeId) {
      var placesInfo = this.placesinfoCache
      var placeName = null
      if (placesInfo != null) {
        Object.keys(placesInfo).forEach(pid => {
          if (pid == placeId) {
            placeName = placesInfo[pid].name
          }
        })
      }
      if (placeName == null) {
        console.log("Place Name Not Found", placeId)
        /*
        // もし名称が設定されていなかったら設定する
        this.getIDtoLocationAPI(placeId).then((res)=>{
          this.savemyplace(placeId, res).then(() => {
            console.log("saved!", placeId)
          })
          .catch((error) => {
            console.log("Firebase Error", error)
          })
        })
        */
        return null
      } else {
        return placeName
      }
    }
    placeidtoname(placeId) {
      return new Promise((resolve) => {
        if (placeId == undefined || placeId == null) {
          resolve(null);
        }
        if (this.placesinfoCache == null) {
          this.fetchusersavedplaces().then(()=>{
            resolve(this.getNameFromPlaceId(placeId))
          })
        } else {
          resolve(this.getNameFromPlaceId(placeId))
        }
      })
    }
  }