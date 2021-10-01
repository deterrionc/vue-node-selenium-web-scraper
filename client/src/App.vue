<template>
  <router-view />
</template>
<script>
  import { mapActions, mapState } from 'vuex'
  export default {
    name: 'app',
    computed: {
      ...mapState({ token: state => state.auth.token })
    },
    methods: {
      ...mapActions(['setAuthToken', 'loadUser'])
    },
    async created() {
      if (this.token) {
        await this.setAuthToken(this.token)
        await this.loadUser()
      }
    }
  }
</script>