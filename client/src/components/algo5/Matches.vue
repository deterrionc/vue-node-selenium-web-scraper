<template>
  <div class="col-md-10 px-3 pb-3">
    <div class="row">
      <div class="col">
        <div style="float:right">
          <br />
          <div style="float:right">
            <button class="btn btn-secondary" v-on:click='scrapeMatches()'>
              Scrape Algo 5 Matches
            </button>
          </div>
          <br />
          <small style="float:right">This will scrape and update DB</small>
        </div>
      </div>
    </div>
    <div class="row pt-2">
      <Spinner v-if="isLoading" />
      <div v-else>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>No</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='(match, index) in matches' v-bind:key="index">
                <td>{{index + 1}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  import Spinner from '../layout/Spinner'

  export default {
    components: { Spinner },
    computed: {
      ...mapState({
        isLoading: state => state.match.isLoading,
        matches: state => state.algo5.matches
      })
    },
    methods: {
      ...mapActions({
        getMatches: 'algo5/getMatches',
        scrapeMatches: 'algo5/scrapeMatches'
      }),
    },
    async created() {
      await this.getMatches()
    }
  }
</script>