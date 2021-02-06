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
    isString(obj) {
      return typeof (obj) == "string" || obj instanceof String;
    }
    isAllValueNotEmpty(objArr) {
      // foreachだと意図した挙動にならないので注意。
      if (objArr.length == 0) {
        return false
      }
      for (var i=0;i<objArr.length;i++) {
        var item = objArr[i]
        if (item == null || item == undefined) {
          return false
        } else {
          if (this.isString(item)) {
            // 文字列のときは文字数をチェック
            if (item.replace(/\s+/g,'').length <= 0) {
              return false
            }
          } else {
            // 配列のときはlengthを取得
            var itemV = null
            if (item.length == undefined) {
              itemV = Object.keys(item)
            } else {
              itemV = item
            }
            if (itemV.length <= 0) {
              return false
            }
          }
        }
      }
      return true
    }
    isObjectIncludeQureyText(obj, queryText) {
      var queryTextSplitedBySpace = queryText.split(/\s+/g)
      for (var i=0;i<obj.length;i++) {
        var item = obj[i]
        if (item != null && item != undefined && item.replace(/\s+/g,'').length > 0) {
          // queryTextSplitedBySpaceのすべてと一致した場合にtrueを返す
          for (var j=0;j<queryTextSplitedBySpace.length;j++) {
            if (item.indexOf(queryTextSplitedBySpace[j]) == -1) {
              return false
            }
          }
          return true
        }
      }
      return false
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
    confirmExPromise(message) {
      if (window.confirm(message)) {
        return Promise.resolve();
      }
      return Promise.reject();
    }
  }