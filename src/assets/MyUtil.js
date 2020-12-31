import axios from 'axios'

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
    isAllValueNotEmpty(objArr) {
      // foreachだと意図した挙動にならないので注意。
      for (var i=0;i<objArr.length;i++) {
        var item = objArr[i]
        if (item == null || item.replace(/\s+/g,'').length <= 0) {
          return false
        }
      }
      return true
    }
    getDiffBetweenTwoObjects(objOld, objNew) {
      var keyOld = Object.keys(objOld)
      var keyNew = Object.keys(objNew)
      var valDiffOld = keyOld.filter(key => objOld[key] != objNew[key])
      var valDiffNew = keyNew.filter(key => objOld[key] != objNew[key])
      var keyDiff = [...valDiffOld, ...valDiffNew].unique()
      var diffValArray = keyDiff.map(key => {
        let tmp_rObj = {}
        tmp_rObj[key] = objNew[key]
        return tmp_rObj
      })

      var returnObj = {}
      diffValArray.forEach(e => {
        var tmp_key = Object.keys(e)[0]
        returnObj[tmp_key] = e[tmp_key]
      })
      return returnObj
    }
    uniqueStr() {
      var strong = 1000
      return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    }
    latlonSixtyToTen(d, m, s) {
      return parseFloat(d) + parseFloat(m/60) + (parseFloat(s)/3600)
    }
    getKeywordsFromSentence(sentence) {
      return new Promise((resolve, reject) => {
        axios.post("https://labs.goo.ne.jp/api/keyword", {'app_id': 'a7740529e5a7d9a250cd44ad93c6b50d0affb2668a13e24e52a607aaa3fbd05c', 'title': 'a', 'body': sentence}, {headers: {'Content-Type': 'application/json'}})
        .then((response) => {
          resolve(response.data.keywords)
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
  }