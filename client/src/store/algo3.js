import api from '../utils/api'

export default {
  namespaced: true,
  state: {
    predictions: [],
  },
  getters: {

  },
  mutations: {
    setMatches(state, payload) {
      state.predictions = payload
    },
  },
  actions: {
    async getMatches(context) {
      this.commit('setIsLoading', true)
      const res = await api.get('/algo3/getMatches')
      if (res.data.success) {
        await context.commit('setMatches', res.data.matches)
        this.commit('setIsLoading', false)
      }
    },
    async scrapeMatches(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/algo3/scrapeMatches')
      if (res.data.success) {
        context.dispatch('getMatches')
      }
    },
  }
}