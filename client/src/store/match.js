import api from '../utils/api'

export default {
  state: {
    matches: [],
    premiumBookmakers: [],
    myBookmakers: [],
    czezhBookmakers: [],
    frenchBookmakers: [],
    italianBookmakers: [],
    polishBookmakers: [],
    russianBookmakers: [],
    slovakBookmakers: [],
    spanishBookmakers: [],
    currentMatch: 'bookmakers',
    isScraping: false,
    isLoading: false,
    currentMatchData: {},
    countries: [],
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
    setBookmakers(state, payload) {
      state.premiumBookmakers = payload.premiumBookmakers
      state.myBookmakers = payload.myBookmakers
      state.czezhBookmakers = payload.czezhBookmakers
      state.frenchBookmakers = payload.frenchBookmakers
      state.italianBookmakers = payload.italianBookmakers
      state.polishBookmakers = payload.polishBookmakers
      state.russianBookmakers = payload.russianBookmakers
      state.slovakBookmakers = payload.slovakBookmakers
      state.spanishBookmakers = payload.spanishBookmakers
    },
    setMatches(state, payload) {
      state.matches = payload
    },
    setCurrentMatchData(state, payload) {
      state.currentMatchData = payload
    },
    setLeagues(state, payload) {
      state.countries = payload
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
    async getBookmakers(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/match/getBookmakers')
      if (res.data.success) {
        context.commit('setBookmakers', res.data)
        context.commit('setIsLoading', false)
      }
    },
    async editBookmaker(context, formData) {
      context.commit('setIsLoading', true)
      const res = await api.post('/match/editBookmaker', formData)
      if (res.data.success) {
        await context.dispatch('getBookmakers')
      }
    },
    async scrapeBookmakers(context) {
      context.commit('setIsScraping', true)
      context.commit('setIsLoading', true)
      const res = await api.get('/match/scrapeBookmakers')
      if (res.data.success) {
        await context.dispatch('getBookmakers')
        context.commit('setIsScraping', false)
      } else {
        alert("Scraping Failed! Please try again!")
        context.commit('setIsScraping', false)
        context.commit('setIsLoading', false)
      }
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
    async scrapeLeagues(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/match/scrapeLeagues')
      if (res.data.success) {
        context.dispatch('getLeagues')
      }
    },
    async getLeagues(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/match/getLeagues')
      if (res.data.success) {
        context.commit('setLeagues', res.data.countries)
        context.commit('setIsLoading', false)
      }
    },
    async updateLeague(context, update) {
      context.commit('setIsLoading', true)
      const res = await api.post(`/match/updateLeague/${update.leagueID}`, { active: update.active })
      if (res.data.success) {
        context.dispatch('getLeagues')
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