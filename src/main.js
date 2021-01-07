import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import firebase from 'firebase'
import "firebase/auth"
import "firebase/database"
import "firebase/analytics"
import VCalendar from 'v-calendar'

Vue.config.productionTip = false

var firebaseConfig = {
  apiKey: "AIzaSyA44l7v2tibBTDEac5LQ0MV2WTBIvyBFWY",
  authDomain: "rspi-cd0a4.firebaseapp.com",
  databaseURL: "https://rspi-cd0a4.firebaseio.com",
  projectId: "rspi-cd0a4",
  storageBucket: "rspi-cd0a4.appspot.com",
  messagingSenderId: "548122730225",
  appId: "1:548122730225:web:c54f80aeb2322270c4d350"
}
firebase.initializeApp(firebaseConfig)
firebase.analytics()

Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
            a.splice(j--, 1);
      }
  }
  return a;
}

new Vue({
  VCalendar,
  router,
  render: h => h(App)
}).$mount('#app')
