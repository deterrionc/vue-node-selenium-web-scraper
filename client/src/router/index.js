import Vue from "vue"
import VueRouter from "vue-router"

import Home from '../components/home/index'
import Auth from '../components/Auth'
import Login from '../components/Auth/Login'
import Register from '../components/Auth/Register'
import Bookmakers from '../components/Bookmakers'
import MatchDetail from '../components/MatchDetail'

import MatchesToday from '../components/MatchesToday'
import Watchlist from '../components/Watchlist'
import Leagues from '../components/Leagues'

import MatchesToday25 from '../components/Over25Tips/MatchesToday25'
import Prediction from '../components/prediction/Prediction'

import dataStore from '../store'

Vue.use(VueRouter)

export default new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/auth", component: Auth,
      beforeEnter(to, from, next) {
        if (dataStore.state.auth.token) {
          next('/home')
        } else {
          next()
        }
      },
      children: [
        { path: "login", component: Login },
        { path: "register", component: Register },
        { path: "", redirect: "/login" }
      ]
    },
    {
      path: "/", component: Home,
      beforeEnter(to, from, next) {
        if (dataStore.state.auth.token) {
          next()
        } else {
          next('/auth/login')
        }
      },
      children: [
        { path: 'bookmakers', component: Bookmakers },
        { path: 'matchesTodayOddsPortal', component: MatchesToday },
        { path: 'watchlist', component: Watchlist },
        { path: 'matchesToday25Tips', component: MatchesToday25 },
        { path: 'leagues', component: Leagues },
        { path: 'match/:id', component: MatchDetail },
        { path: 'prediction', component: Prediction },
        { path: "", redirect: "/bookmakers" }
      ]
    },
    { path: "*", redirect: "/" }
  ]
})