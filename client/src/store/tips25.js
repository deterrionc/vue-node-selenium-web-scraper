import api from '../utils/api'

export default {
  state: {
    isLoading: false,
    matches: [],
    matches4: []
  },
  getters: {

  },
  mutations: {
    setMatchesTip25(state, payload) {
      state.matches = payload
    },
    setMatchesTip25_4(state, payload) {
      state.matches4 = payload
    },
  },
  actions: {
    async getMatchesTodayTips25(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/tips25/getMatches')
      if (res.data.success) {
        await context.commit('setMatchesTip25', res.data.matches)
        context.commit('setIsLoading', false)
      }
    },
    async getMatchesTodayTips25_4(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/tips25/getMatches4')
      if (res.data.success) {
        await context.commit('setMatchesTip25_4', res.data.matches)
        context.commit('setIsLoading', false)
      }
    },
    async scrapeMatchesTodayTips25(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/tips25/scrapeMatchesToday')
      if (res.data.success) {
        context.dispatch('getMatchesTodayTips25')
      }
    },
  }
}