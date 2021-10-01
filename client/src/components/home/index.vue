<template>
  <div class="container-fluid">
    <TopHeader :LOGOUT="LOGOUT" />
    <div class="row">
      <Sidebar />
      <router-view/>
    </div>
  </div>
</template>

<script>
  import TopHeader from '../Header'
  import Sidebar from '../Sidebar'
  import { mapState, mapActions } from 'vuex'

  export default {
    components: { 
      TopHeader, 
      Sidebar, 
    },
    computed: {
      ...mapState({
        currentMatch: state => state.match.currentMatch,
      })
    },
    methods: {
      ...mapActions(['logout', 'getBookmakers', 'getMatches', 'setCurrentMatch']),
      async LOGOUT() {
        await this.logout()
        this.$router.push('/auth/login')
      }
    },
    async created() {
      await this.getBookmakers()
    }
  }
</script>