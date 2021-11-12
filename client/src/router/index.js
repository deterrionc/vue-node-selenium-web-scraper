import Vue from "vue"
import VueRouter from "vue-router"

import Home from '../components/home/index'
import Auth from '../components/auth'
import Login from '../components/auth/Login'
import Register from '../components/auth/Register'
import Bookmakers from '../components/Bookmakers'
import MatchDetail from '../components/MatchDetail'

import MatchesToday from '../components/MatchesToday'
import Watchlist from '../components/Watchlist'
import Leagues from '../components/Leagues'

import Algo2Matches from '../components/algo2/Matches'
import Algo3Matches from '../components/algo3/Matches'
import Algo4Matches from '../components/algo4/Matches'
import Algo5Matches from '../components/algo5/Matches'
import Algo6Matches from '../components/algo6/Matches'

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
        { path: 'leagues', component: Leagues },
        { path: 'match/:id', component: MatchDetail },
        { path: 'algo2', component: Algo2Matches },
        { path: 'algo3', component: Algo3Matches },
        { path: 'algo4', component: Algo4Matches },
        { path: 'algo5', component: Algo5Matches },
        { path: 'algo6', component: Algo6Matches },
        { path: "", redirect: "/bookmakers" }
      ]
    },
    { path: "*", redirect: "/" }
  ]
})