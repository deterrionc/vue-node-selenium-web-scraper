import api from '../utils/api'

export default {
  namespaced: true,
  state: {
    premiumBookmakers: [],
    myBookmakers: [],
    czezhBookmakers: [],
    frenchBookmakers: [],
    italianBookmakers: [],
    polishBookmakers: [],
    russianBookmakers: [],
    slovakBookmakers: [],
    spanishBookmakers: [],
  },
  getters: {

  },
  mutations: {
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
    }
  },
  actions: {
    async getBookmakers(context) {
      context.commit('setIsLoading', true)
      const res = await api.get('/bookmaker/getBookmakers')
      if (res.data.success) {
        context.commit('setBookmakers', res.data)
        context.commit('setIsLoading', false)
      }
    },
    async editBookmaker(context, formData) {
      context.commit('setIsLoading', true)
      const res = await api.post('/bookmaker/editBookmaker', formData)
      if (res.data.success) {
        await context.dispatch('getBookmakers')
      }
    },
    async scrapeBookmakers(context) {
      context.commit('setIsScraping', true)
      context.commit('setIsLoading', true)
      const res = await api.get('/bookmaker/scrapeBookmakers')
      if (res.data.success) {
        await context.dispatch('getBookmakers')
        context.commit('setIsScraping', false)
      } else {
        alert("Scraping Failed! Please try again!")
        context.commit('setIsScraping', false)
        context.commit('setIsLoading', false)
      }
    }
  }
}