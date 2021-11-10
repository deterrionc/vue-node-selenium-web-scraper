import api from '../utils/api'

export default {
  state: {
    matches: [],
    currentMatch: 'bookmakers',
    isScraping: false,
    isLoading: false,
    currentMatchData: {},
    matchDetail: null,
    oddsdatas: [],
    watchlist: []
  },
  getters: {

  },
  mutations: {
    _setCurrentMatch(state, payload) {
      state.currentMatch = payload
    },
    setIsScraping(state, payload) {
      state.isScraping = payload
    },
    setIsLoading(state, payload) {
      state.isLoading = payload
    },
    setMatches(state, payload) {
      state.matches = payload
    },
    setCurrentMatchData(state, payload) {
      state.currentMatchData = payload
    },
    setMatchDetail(state, payload) {
      state.matchDetail = payload.match,
      state.oddsdatas = payload.oddsdatas
    },
    setWatchList(state, payload) {
      state.watchlist = payload
    }
  },
  actions: {
    setCurrentMatch(context, match) {
      context.commit('_setCurrentMatch', match)
    },
    async getMatches(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/match/getMatches')
      if (res.data.success) {
        await context.commit('setMatches', res.data.matches)
        context.commit('setIsLoading', false)
      }
    },
    async scrapeMatchesToday(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/match/scrapeMatchesToday')
      if (res.data.success) {
        context.dispatch('getMatches')
      }
    },
    async getMatchDetail(context, matchID) {
      context.commit('setIsLoading', true)
      const res = await api.get(`/match/getMatchDetail/${matchID}`)
      if (res.data.success) {
        await context.commit('setMatchDetail', res.data)
        context.commit('setIsLoading', false)
      }
    },
    async scrapeMatchDetail(context, formData) {
      context.commit('setIsLoading', true)
      const res = await api.post(`/match/scrapeMatchDetail`, formData)
      if (res.data.success) {
        context.commit('setIsLoading', false)
      }
    },
    async getWatchList(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/match/getWatchList')
      if (res.data.success) {
        await context.commit('setWatchList', res.data.watchlist)
        context.commit('setIsLoading', false)
      }
    }
  }
}