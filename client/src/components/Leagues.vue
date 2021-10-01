<template>
  <div class="col-md-10 px-3 pb-3">
    <!-- <div class="row">
      <div class="col">
        <div style="float:right">
          <br />
          <div style="float:right">
            <button class="btn btn-secondary" v-on:click='scrape_leagues()'>
              Scrape Leagues
            </button>
          </div>
          <br />
          <small style="float:right">This will scrape and update DB</small>
        </div>
      </div>
    </div> -->

    <div class="row pt-2">
      <Spinner v-if="isLoading" />
      <div v-else>
        <div v-for='(country, index) in countries' v-bind:key="index">
          <h5 class="pt-4">{{country.name}}</h5>
          <div class="table-responsive">
            <table class="table table-striped align-middle">
              <thead>
                <tr>
                  <th>No</th>
                  <th>League Name</th>
                  <th>Country Name</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(league, index) in country.leagues" v-bind:key="index">
                  <td>{{index + 1}}</td>
                  <td>{{league.leagueName}}</td>
                  <td>{{league.countryName}}</td>
                  <td>
                    <div class="form-check form-switch">
                      <input :checked='league.active' v-on:change='update_league(league._id, league.active)'
                        class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
        countries: state => state.match.countries
      })
    },
    methods: {
      ...mapActions(['scrapeLeagues', 'getLeagues', 'updateLeague']),
      async scrape_leagues() {
        await this.scrapeLeagues()
      },
      async update_league(leagueID, active) {
        await this.updateLeague({ leagueID: leagueID, active: !active })
      }
    },
    async created() {
      await this.getLeagues()
    }
  }
</script>