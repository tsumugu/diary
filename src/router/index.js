import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/regist',
    name: 'regist',
    component: () => import('../views/RegistEventInfo.vue')
  },
  {
    path: '/editpost/:postid',
    name: 'editpost',
    component: () => import('../views/EditEventinfo.vue')
  },
  {
    path: '/registday/:date',
    name: 'registday',
    component: () => import('../views/RegistReviewTheDay.vue')
  },
  {
    path: '/editdaypost/:postid',
    name: 'editdaypost',
    component: () => import('../views/EditReviewTheDay.vue')
  },
  {
    path: '/editfriends',
    name: 'editfriends',
    component: () => import('../views/EditFriends.vue')
  },
  {
    path: '/analyze',
    name: 'analyze',
    component: () => import('../views/Analyze.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignUp.vue')
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn.vue')
  },
  {
    path: '/signout',
    name: 'signout',
    component: () => import('../views/SignOut.vue')
  },
  {
    path: '*',
    component: () => import('../views/NotFoundComponent.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
