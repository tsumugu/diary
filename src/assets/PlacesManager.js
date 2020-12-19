export default class PlacesManager {
    constructor(arg_axios) {
      this.axios = arg_axios
    }
    searchnearbyplacesbylatlon(lat, lon) {
      return this.axios.get('http://tsumugu2626.xyz/placessearch/nearby.php?lat='+lat+'&lon='+lon)
    }
    searchplacesbyname(query) {
      return this.axios.get(encodeURI('http://tsumugu2626.xyz/placessearch/name.php?q='+query))
    }
  }