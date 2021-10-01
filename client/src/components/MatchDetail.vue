<template>
  <div class='col-md-10 p-3'>
    <div class='d-flex justify-content-end'>
      <a class="btn btn-info" :href='matchDetail ? matchDetail.link : ""' target="_blank">
        Visit This Site
      </a>
      <!-- <button class="btn btn-secondary" v-on:click='scrapeMatchDetail({link: matchDetail.link, matchID: matchDetail._id})'>
        Scrape this match
      </button> -->
    </div>
    <Spinner v-if='isLoading' />
    <div v-else>
      <div class='table-responsive'>
        <table class='table table-striped align-middle'>
          <thead>
            <tr>
              <th>Country</th>
              <th>League</th>
              <th>Match</th>
              <th>Time(GMT - 5)</th>
              <th>Score</th>
              <th>Home</th>
              <th>X</th>
              <th>Away</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{matchDetail.countryName}}</td>
              <td>{{matchDetail.leagueName}}</td>
              <td v-html='matchDetail.name'></td>
              <td>{{matchDetail.time}}</td>
              <td>{{matchDetail.score}}</td>
              <td>{{matchDetail.homeOdds}}</td>
              <td>{{matchDetail.xOdds}}</td>
              <td>{{matchDetail.awayOdds}}</td>
            </tr>
          </tbody>
        </table>
        <table class='table align-middle' v-if='oddsDatas.length'>
          <thead>
            <tr>
              <th>Bookmakers</th>
              <th>1</th>
              <th>2</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for='(odd, index) in oddsDatas' v-bind:key="index" :class='odd.active ? "" : "blocked"'>
              <td>{{odd.bookmaker}}</td>
              <td>
                <span v-if='odd.homeMove === "up"' class="fa fa-long-arrow-up" style="color: green;"></span>
                <span v-if='odd.homeMove === "down"' class="fa fa-long-arrow-down" style="color: red;"></span>
                {{odd.homeOdds}}
              </td>
              <td>
                <span v-if='odd.awayMove === "up"' class="fa fa-long-arrow-up" style="color: green;"></span>
                <span v-if='odd.awayMove === "down"' class="fa fa-long-arrow-down" style="color: red;"></span>
                {{odd.awayOdds}}
              </td>
              <td>{{odd.active ? '' : 'Blocked'}}</td>
            </tr>
          </tbody>
        </table>
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
        matchDetail: state => state.match.matchDetail,
        oddsDatas: state => state.match.oddsdatas,
        isLoading: state => state.match.isLoading,
      })
    },
    methods: {
      ...mapActions(['getMatchDetail', 'scrapeMatchDetail']),
    },
    async created() {
      let matchID = this.$route.params.id
      await this.getMatchDetail(matchID)
    }
  }
</script>

<style scoped>
  .blocked {
    background-color: rgba(155, 155, 155, 0.5);
  }
</style>