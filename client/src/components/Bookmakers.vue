<template>
  <div class="col-md-10 px-3 pb-3">
    <div class="row pt-2">
      <Spinner v-if="isLoading" />
      <div v-else>
        <h3 class="pt-4">Premium Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in premiumBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">My Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in myBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">Crezh Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in czezhBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">French Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in frenchBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">Italian Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in italianBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">Polish Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in polishBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">Russian Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in russianBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">Slovak Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in slovakBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="pt-4">Spanish Bookmakers</h3>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Web Name</th>
                <th>Flag</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, index) in spanishBookmakers" v-bind:key="index">
                <td>{{index + 1}}</td>
                <td>{{b.WebName}}</td>
                <td><a :href='b.Url' target="_blank"><span class="blogos" :class="'l' + b.idProvider"></span></a></td>
                <td>
                  <div class="form-check form-switch">
                    <input :checked='b.setAsMine' v-on:change='edit_bookmaker(b._id, b.setAsMine)' class="form-check-input" type="checkbox" style="width: 40px; height: 20px;">
                  </div>
                </td>
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
        isScraping: state => state.match.isScraping,
        isLoading: state => state.match.isLoading,
        premiumBookmakers: state => state.bookmaker.premiumBookmakers,
        myBookmakers: state => state.bookmaker.myBookmakers,
        czezhBookmakers: state => state.bookmaker.czezhBookmakers,
        frenchBookmakers: state => state.bookmaker.frenchBookmakers,
        italianBookmakers: state => state.bookmaker.italianBookmakers,
        polishBookmakers: state => state.bookmaker.polishBookmakers,
        russianBookmakers: state => state.bookmaker.russianBookmakers,
        slovakBookmakers: state => state.bookmaker.slovakBookmakers,
        spanishBookmakers: state => state.bookmaker.spanishBookmakers,
      })
    },
    methods: {
      ...mapActions({
        scrapeBookmakers: 'bookmaker/scrapeBookmakers',
        getBookmakers: 'bookmaker/getBookmakers',
        editBookmaker: 'bookmaker/editBookmaker'
      }),
      async scrape_bookmakers() {
        await this.scrapeBookmakers()
      },
      async edit_bookmaker(id, setValue) {
        await this.editBookmaker({
          id: id, 
          value: !setValue
        })
      }
    },
    async created() {
      await this.getBookmakers()
    }
  }
</script>