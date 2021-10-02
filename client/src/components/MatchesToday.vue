<template>
  <div class="col-md-10 px-3 pb-3">
    <div class="row">
      <div class="col">
        <div style="float:right">
          <br />
          <div style="float:right">
            <button class="btn btn-secondary" v-on:click='scrape_matches_today()'>
              Scrape Matches Today
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
                <th width='5%'>No</th>
                <th width='20%'>Country » League</th>
                <th width='25%'>Match</th>
                <th width='15%'>Time(GMT - 4)</th>
                <th width='10%'>Score</th>
                <th width='10%'>Home</th>
                <th width='10%'>X</th>
                <th width='10%'>Away</th>
                <th width='5%'>B's</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='(match, index) in matches' v-bind:key="index" v-on:click="goMatchDetail(match._id)"
                :class='setTrRisk(match.risk)'>
                <td>{{index + 1}}</td>
                <td>{{match.countryName}} » {{match.leagueName}}</td>
                <td v-html='match.name'></td>
                <td>{{match.time}}</td>
                <td>{{match.score}}</td>
                <td :class='match.select === "first" ? "chooseMatch" : ""'>{{match.homeOdds}}</td>
                <td>{{match.xOdds}}</td>
                <td :class='match.select === "second" ? "chooseMatch" : ""'>{{match.awayOdds}}</td>
                <td>{{match.bs}}</td>
                <td>{{match.risk}}</td>
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
  import Spinner from './layout/Spinner'

  export default {
    components: { Spinner },
    computed: {
      ...mapState({
        isLoading: state => state.match.isLoading,
        matches: state => state.match.matches
      })
    },
    methods: {
      ...mapActions(['scrapeMatchesToday', 'getMatches']),
      async scrape_matches_today() {
        await this.scrapeMatchesToday()
      },
      goMatchDetail(link) {
        this.$router.push(`/match/${link}`)
      },
      setTrRisk (risk) {
        // console.log(risk)
        if (risk === 'Good') return 'select'
        if (risk === 'High Risk') return 'highRisk'
        return ''
      }
    },
    async created() {
      await this.getMatches()
    }
  }
</script>

<style scoped>
  tr {
    cursor: pointer;
  }
  .select {
    background-color: #0DCAEE44;
  }
  .highRisk {
    background-color: #dc354544;
  }
  .chooseMatch {
    background-color: #198754;
  }
</style>