<template>
  <div class="col-md-2 p-2" style="background-color: #3f51b5; min-height: 100vh;">
    <div class="mb-5">
      <div class="container-fluid">
        <h6 class="text-center text-white">Asian Handicap 0 Soccer Strategy</h6>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('bookmakers')"
            v-bind:class="currentMatch === 'bookmakers' ? 'btn-light' : 'btn-success'">
            Bookmakers
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('leagues')"
          v-bind:class="currentMatch === 'leagues' ? 'btn-light' : 'btn-success'">
            Leagues
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('matchesTodayOddsPortal')"
          v-bind:class="currentMatch === 'matchesTodayOddsPortal' ? 'btn-light' : 'btn-success'">
            Algo 1 Matches
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('watchlist')"
          v-bind:class="currentMatch === 'watchlist' ? 'btn-light' : 'btn-success'">
            Algo 1 (Watch List)
          </button>
        </div>
        <hr style="color: white; height: 3px;">
        <h6 class="text-center text-white">Over/Under Strategy</h6>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('algo2')"
          v-bind:class="currentMatch === 'algo2' ? 'btn-light' : 'btn-success'">
            Algo 2 Matches
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('algo3')"
          v-bind:class="currentMatch === 'algo3' ? 'btn-light' : 'btn-success'">
            Algo 3 Matches
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('algo4')"
          v-bind:class="currentMatch === 'algo4' ? 'btn-light' : 'btn-success'">
            Algo 4 Matches
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('algo5')"
          v-bind:class="currentMatch === 'algo5' ? 'btn-light' : 'btn-success'">
            Algo 5 Matches
          </button>
        </div>
        <div class="row my-2">
          <button class="btn btn-block" v-on:click="SetCurrentMatch('algo6')"
          v-bind:class="currentMatch === 'algo6' ? 'btn-light' : 'btn-success'">
            Algo 6 Matches
          </button>
        </div>
        <hr style="color: white; height: 3px;">
        <div class="row my-2">
          <button class="btn btn-block btn-danger" v-on:click='LOGOUT'>
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  export default {
    computed: {
      ...mapState({
        matches: state => state.match.matches,
        currentMatch: state => state.match.currentMatch,
      })
    },
    methods: {
      ...mapActions(['logout', 'setCurrentMatch']),
      SetCurrentMatch(match) {
        if (typeof(match) === 'string') {
          this.setCurrentMatch(match)
          this.$router.push(`/${match}`)
        } else {
          this.setCurrentMatch(match._id)
          this.$router.push(`/${match._id}`)
        }
      },
      async LOGOUT() {
        await this.logout()
        this.$router.push('/auth/login')
      },
    },
    async created() {
      if (this.$router.currentRoute.params.id) {
        this.setCurrentMatch(this.$router.currentRoute.params.id)
      }
    }
  }
</script>