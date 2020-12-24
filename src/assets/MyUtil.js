export default class MyUtil {
    constructor() {
    }
    isObjNotEmpty(obj) {
      if (obj == undefined || obj == null) {
        return false
      } else {
        return Object.keys(obj).length != 0
      }
    }
    uniqueStr() {
      var strong = 1000
      return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    }
    latlonSixtyToTen(d, m, s) {
      return parseFloat(d) + parseFloat(m/60) + (parseFloat(s)/3600)
    }
  }