export default class PlacesManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
    }
    searchnearbyplacesbylatlon(lat, lon) {
      return this.axios.get('http://tsumugu2626.xyz/placessearch/nearby.php?lat='+lat+'&lon='+lon)
    }
    searchplacesbyname(query) {
      return this.axios.get(encodeURI('http://tsumugu2626.xyz/placessearch/name.php?q='+query))
    }
    searchplacesbyname(query) {
      return this.axios.get(encodeURI('http://tsumugu2626.xyz/placessearch/name.php?q='+query))
    }
    savemyplace(place_id, place_name) {
      return new Promise((resolve, reject) => {
        this.database.ref("places/"+this.userInfo.uid+"/"+place_id).set({name: place_name}).then(() => {
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
    fetchusersavedplaces() {
      return new Promise((resolve) => {
        this.database.ref("places/"+this.userInfo.uid).on('value', (snapshot) =>{
          var placesinfo = snapshot.val()
          resolve(placesinfo)
        })
      })
    }
    placeidtoname(place_id) {
      return new Promise((resolve) => {
        this.database.ref("places/"+this.userInfo.uid).on('value', (snapshot) =>{
          var placesInfo = snapshot.val()
          var placeName = null
          Object.keys(placesInfo).forEach(pid => {
            if (pid == place_id) {
              placeName = placesInfo[pid].name
            }
          })
          resolve(placeName)
        })
      })
    }
  }