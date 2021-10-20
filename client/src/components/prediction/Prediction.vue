<template>
  <div class="col-md-10 px-3 pb-3">
    <div class="row">
      <div class="col">
        <div style="float:right">
          <br />
          <div style="float:right">
            <button class="btn btn-secondary" v-on:click='scrapePredictionMatches()'>
              Scrape Prediction
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
                <th>Winning Team</th>
                <th>Probability</th>
                <th>Visit</th>
                <th>Match</th>
                <th>Country</th>
                <th>League</th>
                <th>Date of Fixture</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='(prediction, index) in predictions' v-bind:key="index"
                :class='setTrRisk(prediction.risk1, prediction.risk2)'>
                <td>{{index + 1}}</td>
                <td>{{prediction.winningTeam}}</td>
                <td>{{prediction.percent}}%</td>
                <td>
                  <a target="_blank" :href='prediction.link'>Visit the Match</a>
                </td>
                <td>{{prediction.firstTeam}} <span class="text-danger">vs</span> {{prediction.secondTeam}}</td>
                <td>{{prediction.country}}</td>
                <td>{{prediction.league}}</td>
                <td>{{prediction.date.slice(0,10)}}</td>
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
        predictions: state => state.prediction.predictions
      })
    },
    methods: {
      ...mapActions(['getPredictionMatches', 'scrapePredictionMatches']),
      setTrRisk(risk1, risk2) {
        console.log(risk1, risk2)
        if (risk1 === 'Available') {
          if (risk2 === 'Good') return 'Good'
          return 'Available'
        }
        if (risk2 === 'Exist') return 'Exist'
        return ''
      }
    },
    async created() {
      await this.getPredictionMatches()
    }
  }
</script>

<style scoped>
  .Available {
    background-color: #0DCAEE44;
  }

  .Exist {
    background-color: #7e3878;
  }

  .Good {
    background-color: #99b433;
  }
</style>