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
    path: '/friends',
    name: 'friends',
    component: () => import('../views/Friends.vue')
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
