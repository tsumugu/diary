import Vue from 'vue'
import VueRouter from 'vue-router'
import firebase from 'firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/regist',
    name: 'regist',
    component: () => import('../views/RegistEventInfo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/editpost/:postid',
    name: 'editpost',
    component: () => import('../views/EditEventinfo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:userid',
    name: 'useranalyze',
    component: () => import('../views/UserAnalyze.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/editfriendslist',
    name: 'editfriendslist',
    component: () => import('../views/EditFriendsList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/editfriends',
    name: 'editfriends',
    component: () => import('../views/EditFriends.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/editpostlist',
    name: 'editpostlist',
    component: () => import('../views/EditPostList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignUp.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signout',
    name: 'signout',
    component: () => import('../views/SignOut.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '*',
    component: () => import('../views/NotFoundComponent.vue'),
    meta: { requiresAuth: false }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next)=>{
  if (to.matched.some(record => record.meta.requiresAuth)) {
    firebase.auth().onAuthStateChanged(user => {
      if (user != null) {
        next()
      } else {
        next("/signin")
      }
    })
  } else {
    next()
  }
})

export default router
