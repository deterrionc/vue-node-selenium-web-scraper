import api from '../utils/api'

export default {
  state: {
    isLoading: false,
    matches: []
  },
  getters: {

  },
  mutations: {
    setPredictionMatches(state, payload) {
      state.matches = payload
    },
  },
  actions: {
    async getPredictionMatches(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/prediction/getMatches')
      if (res.data.success) {
        await context.commit('setPredictionMatches', res.data.matches)
        context.commit('setIsLoading', false)
      }
    },
    async scrapePredictionMatches(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/prediction/scrapePredictionMatches')
      if (res.data.success) {
        context.dispatch('getPredictionMatches')
      }
    },
  }
}