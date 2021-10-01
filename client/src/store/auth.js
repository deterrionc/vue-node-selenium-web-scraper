import api from '../utils/api'

export default {
  state: {
    token: localStorage.getItem('token'),
    authenticated: false,
    user: null,
  },
  getters: {

  },
  mutations: {
    setToken(state, payload) {
      state.token = payload
    },
    setUserLoaded(state, payload) {
      state.authenticated = true
      state.user = payload
    },
    setUserLogout(state) {
      state.authenticated = false
      state.token = null,
      state.user = null
    },
  },
  actions: {
    async loadUser(context) {
      const res = await api.get('/auth')
      context.commit('setUserLoaded', res.data)
    },
    async setAuthToken(context, token) {
      if (token) {
        context.commit('setToken', token)
        api.defaults.headers.common['x-auth-token'] = token
        localStorage.setItem('token', token)
      } else {
        delete api.defaults.headers.common['x-auth-token']
        localStorage.removeItem('token')
      }
    },
    async registerUser(context, formData) {
      const res = await api.post('/users', formData)
      await context.dispatch('setAuthToken', res.data.token)
      await context.dispatch('loadUser')
    },
    async login(context, formData) {
      const res = await api.post('/auth', formData)
      await context.dispatch('setAuthToken', res.data.token)
      await context.dispatch('loadUser')
    },
    async logout(context) {
      context.dispatch('setAuthToken')
      context.commit('setUserLogout')
    }
  }
}