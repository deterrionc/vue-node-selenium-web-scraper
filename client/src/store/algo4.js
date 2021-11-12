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
      const res = await api.get('/algo4/getMatches')
      if (res.data.success) {
        await context.commit('setMatches', res.data.matches)
        this.commit('setIsLoading', false)
      }
    },
    async scrapeMatches(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/algo4/scrapeMatches')
      if (res.data.success) {
        this.commit('setIsLoading', true)
      }
    },
  }
}