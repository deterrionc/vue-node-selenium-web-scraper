import Vue from "vue"
import Vuex from "vuex"

import AuthModule from "./auth"
import matchModule from './match'
import Tips25Module from './tips25'
import PredictionModule from './prediction'
import Algo5Module from './algo5'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: { 
    auth: AuthModule, 
    match: matchModule, 
    tips25: Tips25Module,
    prediction: PredictionModule,
    algo5: Algo5Module
  },
  state: {
    authenticated: false,
    jwt: null
  },
  getters: {

  },
  mutations: {

  },
  actions: {
    
  }
})