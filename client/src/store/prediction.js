import api from '../utils/api'

export default {
  state: {
    isLoading: false,
    predictions: []
  },
  getters: {

  },
  mutations: {
    setPredictionMatches(state, payload) {
      state.predictions = payload
    },
  },
  actions: {
    async getPredictionMatches(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/prediction/getPredictionMatches')
      if (res.data.success) {
        await context.commit('setPredictionMatches', res.data.predictions)
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