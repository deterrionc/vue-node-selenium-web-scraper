<template>
  <div class="col-md-10 px-3 pb-3">
    <div class="row">
      <div class="col">
        <div style="float:right">
          <br />
          <div style="float:right">
            <button class="btn btn-secondary" v-on:click='scrapeMatchesTodayTips25()'>
              Scrape Matches Today Tips 25
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
                <th>Time(GMT - 4)</th>
                <th>Country League</th>
                <th>Match</th>
                <th>H1</th>
                <th>H2</th>
                <th>A1</th>
                <th>A2</th>
                <th>A3</th>
                <th>A4</th>
                <th>Probability</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='(match, index) in matches' v-bind:key="index" :class='setTrRisk(match.risk)'>
                <td>{{index + 1}}</td>
                <td>{{match.time}}</td>
                <td>{{match.league}}</td>
                <td>{{match.homeTeam}} <span class="text-danger">vs</span> {{match.awayTeam}}</td>
                <td>{{match.h1}}</td>
                <td>{{match.h2}}</td>
                <td>{{match.a1}}</td>
                <td>{{match.a2}}</td>
                <td>{{match.a3}}</td>
                <td>{{match.a4}}</td>
                <td>{{match.probability}}%</td>
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
  import Spinner from '../layout/Spinner'

  export default {
    components: { Spinner },
    computed: {
      ...mapState({
        isLoading: state => state.match.isLoading,
        matches: state => state.tips25.matches
      })
    },
    methods: {
      ...mapActions(['scrapeMatchesTodayTips25', 'getMatchesTodayTips25']),
      setTrRisk (risk) {
        // console.log(risk)
        if (risk === 'Good T1' || risk === 'Good T2') return 'select'
        if (risk === 'Great') return 'highRisk'
        return ''
      }
    },
    async created() {
      await this.getMatchesTodayTips25()
    }
  }
</script>

<style scoped>
  .select {
    background-color: #0DCAEE44;
  }
  .highRisk {
    background-color: #146c4388;
  }
</style>