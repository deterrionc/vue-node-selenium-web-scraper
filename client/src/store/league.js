import api from '../utils/api'

export default {
  namespaced: true,
  state: {
    countries: [],
  },
  getters: {

  },
  mutations: {
    setLeagues(state, payload) {
      state.countries = payload
    },
  },
  actions: {
    async scrapeLeagues(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/league/scrapeLeagues')
      if (res.data.success) {
        context.dispatch('getLeagues')
      }
    },
    async getLeagues(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/league/getLeagues')
      if (res.data.success) {
        context.commit('setLeagues', res.data.countries)
        context.commit('setIsLoading', false)
      }
    },
    async updateLeague(context, update) {
      context.commit('setIsLoading', true)
      const res = await api.post(`/league/updateLeague/${update.leagueID}`, { active: update.active })
      if (res.data.success) {
        context.dispatch('getLeagues')
      }
    },
  }
}