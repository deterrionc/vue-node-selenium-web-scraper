import api from '../utils/api'

export default {
  namespaced: true,
  state: {
    matches: [],
  },
  getters: {

  },
  mutations: {
    setMatches(state, payload) {
      state.matches = payload
    },
  },
  actions: {
    async getMatches(context) {
      this.commit('setIsLoading', true)
      const res = await api.get('/algo5/getMatches')
      if (res.data.success) {
        await context.commit('setMatches', res.data.matches)
        this.commit('setIsLoading', false)
      }
    },
    async scrapeMatches(context) {
      this.commit('setIsLoading', true)
      const res = await api.get('/algo5/scrapeMatches')
      if (res.data.success) {
        context.dispatch('getMatches')
      }
    },
  }
}