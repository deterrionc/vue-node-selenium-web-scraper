<template>
  <div class="col-md-10 px-3 pb-3">
    <div class="row pt-2">
      <Spinner v-if="isLoading" />
      <div v-else>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th width='5%'>No</th>
                <th width='20%'>League</th>
                <th width='25%'>Match</th>
                <th width='15%'>Time(GMT - 4)</th>
                <th width='10%'>Home</th>
                <th width='10%'>X</th>
                <th width='10%'>Away</th>
                <th width='5%'>B's</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for='(match, index) in matches' v-bind:key="index" :class='setTrRisk(match.risk)'>
                <td>{{index + 1}}</td>
                <td>{{match.leagueName}}</td>
                <td v-html='match.name'></td>
                <td>{{match.time}}</td>
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
        matches: state => state.match.watchlist
      })
    },
    methods: {
      ...mapActions(['getWatchList']),
      setTrRisk (risk) {
        if (risk === 'Good') return 'select'
        if (risk === 'High Risk') return 'highRisk'
        return ''
      },
      goMatchDetail(link) {
        this.$router.push(`/match/${link}`)
      },
    },
    async created() {
      await this.getWatchList()
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