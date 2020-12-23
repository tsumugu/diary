export default class PlacesManager {
    constructor(arg_axios, arg_firebase_database, arg_userinfo) {
      this.axios = arg_axios
      this.database = arg_firebase_database
      this.userInfo = arg_userinfo
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
    fetchusersavedplaces() {
      return new Promise((resolve) => {
        this.database.ref("places/"+this.userInfo.uid).on('value', (snapshot) =>{
          var placesinfo = snapshot.val()
          resolve(placesinfo)
        })
      })
    }
    placeidtoname(placeId) {
      return new Promise((resolve) => {
        //placeIdの最初がpid_だったら
        if (placeId.substr(0, 4) == "pid_") {
          this.database.ref("places/"+this.userInfo.uid).on('value', (snapshot) =>{
            var placesInfo = snapshot.val()
            var placeName = null
            if (placesInfo != null) {
              Object.keys(placesInfo).forEach(pid => {
                if (pid == placeId) {
                  placeName = placesInfo[pid].name
                }
              })
            }
            if (placeName == null) {
              this.axios.get('https://secure.tsumugu2626.xyz/placessearch/idtoname.php?pid='+placeId).then((res)=>{
                placeName = res.data
                resolve(placeName)
              })
            } else {
              resolve(placeName)
            }
          })
        } else {
          // GoogleのPlace IDなので、いい感じに変換
          this.axios.get('https://secure.tsumugu2626.xyz/placessearch/idtoname.php?pid='+placeId).then((res)=>{
            resolve(res.data)
          })
        }
      })
    }
  }