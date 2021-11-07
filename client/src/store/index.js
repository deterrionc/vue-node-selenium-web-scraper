import Vue from "vue"
import Vuex from "vuex"

import AuthModule from "./auth"
import matchModule from './match'
import PredictionModule from './prediction'
import Algo2Module from './algo2'
import Algo3Module from './algo3'
import Algo4Module from './algo4'
import Algo5Module from './algo5'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: { 
    auth: AuthModule, 
    match: matchModule, 
    prediction: PredictionModule,
    algo2: Algo2Module,
    algo3: Algo3Module,
    algo4: Algo4Module,
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